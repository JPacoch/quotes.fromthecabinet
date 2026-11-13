import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get("exclude");
    const supabase = getSupabase();

    let query = supabase
      .from("quotes")
      .select("id, content, author, source, publish_date")
      .lte("publish_date", today);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return NextResponse.json(
        { error: "No other quotes available" },
        { status: 404 }
      );
    }

    const random = data[Math.floor(Math.random() * data.length)];
    return NextResponse.json(random);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch random quote";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
