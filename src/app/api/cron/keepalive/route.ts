import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Lightweight weekly keepalive endpoint to prevent Supabase free-tier auto-pausing.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from("quotes")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("Supabase keepalive failed:", error);
      return NextResponse.json(
        { ok: false, error: error.message, pingedAt: new Date().toISOString() },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        pingedAt: new Date().toISOString(),
        quotesCount: count ?? 0,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Keepalive ping failed";
    console.error("Supabase keepalive error:", err);
    return NextResponse.json(
      { ok: false, error: message, pingedAt: new Date().toISOString() },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
