import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const today = new Date().toISOString().split("T")[0];
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get("exclude");


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
}
