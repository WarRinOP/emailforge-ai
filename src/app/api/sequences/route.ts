import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const VALID_SEQUENCE_TYPES = [
  "cold_outreach",
  "follow_up",
  "welcome_drip",
  "re_engagement",
  "sales_nurture",
];

// ── GET /api/sequences ─────────────────────────────────────────────────────
// Query params: ?search=text, ?type=cold_outreach, ?period=week|month|all
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const type = searchParams.get("type")?.trim() ?? "";
    const period = searchParams.get("period")?.trim() ?? "all";

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("ef_sequences")
      .select("*")
      .order("created_at", { ascending: false });

    // Filter: search in offer field
    if (search) {
      query = query.ilike("offer", `%${search}%`);
    }

    // Filter: sequence type
    if (type && VALID_SEQUENCE_TYPES.includes(type)) {
      query = query.eq("sequence_type", type);
    }

    // Filter: date period
    if (period === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte("created_at", weekAgo.toISOString());
    } else if (period === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte("created_at", monthAgo.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── DELETE /api/sequences ──────────────────────────────────────────────────
// Body: { id: string }
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "id is required in request body" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Check it exists first
    const { data: existing, error: fetchError } = await supabase
      .from("ef_sequences")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Sequence not found" },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("ef_sequences")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: `Delete error: ${deleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
