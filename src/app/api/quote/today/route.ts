import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
    const today = new Date().toISOString().split("T")[0];

    const { data: exact, error: exactErr } = await supabase
        .from("quotes")
        .select("id, content, author, source, publish_date")
        .eq("publish_date", today)
        .single();

    if (exactErr) console.error("Supabase Error (Exact Match):", exactErr);

    if (exact && !exactErr) {
        return NextResponse.json(exact);
    }

    const { data: latest, error: latestErr } = await supabase
        .from("quotes")
        .select("id, content, author, source, publish_date")
        .lte("publish_date", today)
        .order("publish_date", { ascending: false })
        .limit(1)
        .single();

    if (latestErr) console.error("Supabase Error (Latest Match):", latestErr);

    if (latestErr || !latest) {
        return NextResponse.json(
            { error: "No quotes available for today", detail: latestErr?.message },
            { status: 404 }
        );
    }

    return NextResponse.json(latest);
}
