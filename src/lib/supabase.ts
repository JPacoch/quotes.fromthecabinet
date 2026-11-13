import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface QuoteRow {
  id: string;
  content: string;
  author: string;
  source: string | null;
  publish_date: string;
  created_at: string;
}

let cachedClient: SupabaseClient | null = null;

/**
 * Lazily initializes and returns the Supabase client using SUPABASE_URL and SUPABASE_KEY.
 * Deferring instantiation avoids throwing during build-time module evaluation when env vars are absent.
 */
export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_KEY environment variables.");
  }

  cachedClient = createClient(supabaseUrl, supabaseKey);
  return cachedClient;
}
