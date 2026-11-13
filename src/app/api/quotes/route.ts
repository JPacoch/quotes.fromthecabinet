import { NextResponse } from "next/server";
import { fetchPublishedQuotes } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await fetchPublishedQuotes();

  if (result.error) {
    return NextResponse.json(
      { error: result.error, quotes: [], todayQuoteId: null },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { quotes: result.quotes, todayQuoteId: result.todayQuoteId },
    { headers: { "Cache-Control": "no-store" } }
  );
}
