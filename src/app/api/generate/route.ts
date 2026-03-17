import { NextRequest, NextResponse } from "next/server";
import { generateWithClaude } from "@/lib/claude";
import { getSupabaseAdmin } from "@/lib/supabase";

const VALID_SEQUENCE_TYPES = [
  "cold_outreach",
  "follow_up",
  "welcome_drip",
  "re_engagement",
  "sales_nurture",
] as const;

const VALID_TONES = [
  "professional",
  "conversational",
  "direct",
  "friendly",
] as const;

const SEQUENCE_TYPE_LABELS: Record<string, string> = {
  cold_outreach: "Cold Outreach",
  follow_up: "Follow-Up",
  welcome_drip: "Welcome Drip",
  re_engagement: "Re-engagement",
  sales_nurture: "Sales Nurture",
};

function buildSystemPrompt(): string {
  return `You are an expert email copywriter and outreach strategist. Write email sequences that get replies. Every email must feel personal, not templated.
Respond with a single valid JSON object. No markdown. No backticks. No explanation. No text before or after the JSON.`;
}

function buildUserPrompt(params: {
  sequenceType: string;
  emailCount: number;
  offer: string;
  targetAudience: string;
  tone: string;
  senderName: string;
  companyName: string;
}): string {
  const typeLabel =
    SEQUENCE_TYPE_LABELS[params.sequenceType] ?? params.sequenceType;

  return `Write a ${typeLabel} email sequence with exactly ${params.emailCount} emails.

Offer: ${params.offer}
Target audience: ${params.targetAudience}
Tone: ${params.tone}
Sender: ${params.senderName}
Company: ${params.companyName}

Return ONLY this JSON:
{
  "emails": [
    {
      "position": 1,
      "send_timing": "<e.g. Send on Day 1>",
      "subject_lines": [
        "<subject line variant A — direct and clear>",
        "<subject line variant B — curiosity-driven>"
      ],
      "body": "<full email body, 100-200 words, personalized to the offer and audience, no filler phrases like 'Hope this finds you well', signed with sender name>",
      "purpose": "<1 sentence: what this email is trying to achieve>"
    }
  ]
}

Repeat the email object for all ${params.emailCount} emails. Use these send timings as a guide:
- Email 1: Day 1
- Email 2: Day 3
- Email 3: Day 7
- Email 4: Day 14
- Email 5: Day 21
- Email 6: Day 28 (if applicable)
- Email 7: Day 35 (if applicable)

Important rules:
- Each email must be meaningfully different from the previous one
- Build a narrative arc across the sequence
- Subject line A should be direct and clear
- Subject line B should create curiosity or use a hook
- Body must reference the specific offer — never be generic
- Final email should be a polite breakup/closing email
- subject_lines must always be an array of exactly 2 strings
- emails array must contain exactly ${params.emailCount} items`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      offer,
      targetAudience,
      sequenceType = "cold_outreach",
      tone = "professional",
      emailCount,
      senderName,
      companyName,
    } = body;

    // ── Validation ──────────────────────────────────────────────
    if (!offer || typeof offer !== "string" || offer.trim().length === 0) {
      return NextResponse.json(
        { error: "offer is required" },
        { status: 400 }
      );
    }

    if (
      !targetAudience ||
      typeof targetAudience !== "string" ||
      targetAudience.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "targetAudience is required" },
        { status: 400 }
      );
    }

    const parsedEmailCount =
      emailCount !== undefined ? parseInt(String(emailCount), 10) : 5;
    if (![5, 6, 7].includes(parsedEmailCount)) {
      return NextResponse.json(
        { error: "emailCount must be 5, 6, or 7" },
        { status: 400 }
      );
    }

    if (!VALID_SEQUENCE_TYPES.includes(sequenceType as never)) {
      return NextResponse.json(
        { error: `sequenceType must be one of: ${VALID_SEQUENCE_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!VALID_TONES.includes(tone as never)) {
      return NextResponse.json(
        { error: `tone must be one of: ${VALID_TONES.join(", ")}` },
        { status: 400 }
      );
    }

    const resolvedSenderName =
      senderName && senderName.trim() ? senderName.trim() : "the sender";
    const resolvedCompanyName =
      companyName && companyName.trim() ? companyName.trim() : "our company";

    // ── Call Claude ──────────────────────────────────────────────
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt({
      sequenceType,
      emailCount: parsedEmailCount,
      offer: offer.trim(),
      targetAudience: targetAudience.trim(),
      tone,
      senderName: resolvedSenderName,
      companyName: resolvedCompanyName,
    });

    let rawResponse: string;
    try {
      rawResponse = await generateWithClaude(systemPrompt, userPrompt);
    } catch (claudeError) {
      const message =
        claudeError instanceof Error ? claudeError.message : "Unknown error";
      return NextResponse.json(
        { error: `Claude API error: ${message}` },
        { status: 500 }
      );
    }

    // ── Parse JSON ───────────────────────────────────────────────
    let parsed: { emails: unknown[] };
    try {
      // Strip any accidental markdown code fences Claude might add
      const cleaned = rawResponse
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "");
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse Claude response — invalid JSON returned" },
        { status: 500 }
      );
    }

    if (!Array.isArray(parsed?.emails) || parsed.emails.length === 0) {
      return NextResponse.json(
        { error: "Failed to parse Claude response — emails array missing or empty" },
        { status: 500 }
      );
    }

    // Warn on count mismatch but continue (Claude sometimes returns ±1)
    if (parsed.emails.length !== parsedEmailCount) {
      console.warn(
        `[EmailForge] Email count mismatch: requested ${parsedEmailCount}, got ${parsed.emails.length}`
      );
    }

    // ── Save to Supabase ─────────────────────────────────────────
    const supabase = getSupabaseAdmin();
    const { data, error: dbError } = await supabase
      .from("ef_sequences")
      .insert({
        offer: offer.trim(),
        target_audience: targetAudience.trim(),
        sequence_type: sequenceType,
        tone,
        email_count: parsedEmailCount,
        sender_name: senderName?.trim() || null,
        company_name: companyName?.trim() || null,
        emails: parsed.emails,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
