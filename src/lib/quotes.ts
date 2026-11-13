import { getSupabase, type QuoteRow } from "@/lib/supabase";

export interface QuoteItem {
  id: string;
  content: string;
  author: string;
  source: string | null;
  publish_date: string;
  year: string;
  weekLabel: string;
  sourceUrl: string | null;
  sourceLabel: string | null;
}

function getTodayIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getISOWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatWeekLabel(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  const week = String(getISOWeekNumber(parsed)).padStart(2, "0");
  return `Week ${week} · ${parsed.getUTCFullYear()}`;
}

export function formatTooltipHostPath(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/$/, "");
    const combined = `${host}${path}`;
    return `${combined.length > 44 ? `${combined.slice(0, 41)}…` : combined} ↗`;
  } catch {
    return `${rawUrl} ↗`;
  }
}

function parseSource(source: string | null): {
  sourceUrl: string | null;
  sourceLabel: string | null;
} {
  if (!source) return { sourceUrl: null, sourceLabel: null };
  const trimmed = source.trim();
  if (!trimmed) return { sourceUrl: null, sourceLabel: null };

  if (/^https?:\/\/\S+$/i.test(trimmed)) {
    return {
      sourceUrl: trimmed,
      sourceLabel: formatTooltipHostPath(trimmed).replace(/ ↗$/, ""),
    };
  }

  return { sourceUrl: null, sourceLabel: trimmed };
}

export function formatQuoteRow(
  row: Pick<QuoteRow, "id" | "content" | "author" | "source" | "publish_date">
): QuoteItem {
  const { sourceUrl, sourceLabel } = parseSource(row.source);
  const year = row.publish_date?.slice(0, 4) || "";

  return {
    id: row.id,
    content: row.content,
    author: row.author,
    source: row.source,
    publish_date: row.publish_date,
    year,
    weekLabel: formatWeekLabel(row.publish_date),
    sourceUrl,
    sourceLabel,
  };
}

interface QuotesFetchResult {
  quotes: QuoteItem[];
  todayQuoteId: string | null;
  error: string | null;
}

/**
 * Fetches today's quote (exact publish_date match, or most recent quote with publish_date <= today).
 */
export async function fetchTodayQuote(): Promise<{
  quote: QuoteItem | null;
  totalCount: number;
  error: string | null;
}> {
  try {
    const today = getTodayIsoDate();
    const supabase = getSupabase();

    const [{ data: exact }, { data: latest, error: latestErr }, { count }] =
      await Promise.all([
        supabase
          .from("quotes")
          .select("id, content, author, source, publish_date")
          .eq("publish_date", today)
          .single(),
        supabase
          .from("quotes")
          .select("id, content, author, source, publish_date")
          .lte("publish_date", today)
          .order("publish_date", { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("quotes")
          .select("id", { count: "exact", head: true })
          .lte("publish_date", today),
      ]);

    if (exact) {
      return {
        quote: formatQuoteRow(exact),
        totalCount: count ?? 1,
        error: null,
      };
    }

    if (latestErr || !latest) {
      return {
        quote: null,
        totalCount: count ?? 0,
        error: latestErr?.message ?? "No quotes available for today",
      };
    }

    return {
      quote: formatQuoteRow(latest),
      totalCount: count ?? 1,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load today's quote";
    console.error("Today quote fetch error:", err);
    return { quote: null, totalCount: 0, error: message };
  }
}

/**
 * Fetches all published quotes (publish_date <= today) ordered newest-first.
 */
export async function fetchPublishedQuotes(): Promise<QuotesFetchResult> {
  try {
    const today = getTodayIsoDate();
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("quotes")
      .select("id, content, author, source, publish_date")
      .lte("publish_date", today)
      .order("publish_date", { ascending: false });

    if (error) {
      console.error("Supabase Error (Quotes List):", error);
      return { quotes: [], todayQuoteId: null, error: error.message };
    }

    const rows = data ?? [];
    const quotes = rows.map(formatQuoteRow);
    const exactToday = rows.find((row) => row.publish_date === today);
    const todayQuoteId = exactToday?.id ?? rows[0]?.id ?? null;

    return { quotes, todayQuoteId, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load quotes";
    console.error("Quotes fetch error:", err);
    return { quotes: [], todayQuoteId: null, error: message };
  }
}

/**
 * Fetches a single published quote by its ID.
 */
export async function fetchPublishedQuoteById(id: string): Promise<QuoteItem | null> {
  try {
    const today = getTodayIsoDate();
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("quotes")
      .select("id, content, author, source, publish_date")
      .eq("id", id)
      .lte("publish_date", today)
      .single();

    if (error || !data) {
      return null;
    }

    return formatQuoteRow(data);
  } catch {
    return null;
  }
}
