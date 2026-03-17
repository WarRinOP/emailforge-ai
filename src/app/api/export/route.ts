import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  formatSequenceExport,
  type SequenceRecord,
} from "@/lib/export";

/**
 * Generate a safe filename slug from the offer text.
 * Uses the first 4 words, lowercased, hyphen-separated, max 30 chars.
 */
function offerToSlug(offer: string): string {
  return offer
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join("-")
    .slice(0, 30);
}

// ── GET /api/export?id= ────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("ef_sequences")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Sequence not found" },
        { status: 404 }
      );
    }

    const sequence = data as SequenceRecord;

    if (!Array.isArray(sequence.emails) || sequence.emails.length === 0) {
      return NextResponse.json(
        { error: "Sequence has no emails to export" },
        { status: 400 }
      );
    }

    const content = formatSequenceExport(sequence);

    // Build filename: emailforge-{offer-slug}-{date}.txt
    const dateStr = new Date(sequence.created_at)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");
    const offerSlug = offerToSlug(sequence.offer);
    const filename = `emailforge-${offerSlug}-${dateStr}.txt`;

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
