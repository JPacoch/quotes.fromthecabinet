import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface QuoteRow {
    id: string;
    content: string;
    author: string;
    source: string | null;
    publish_date: string;
    created_at: string;
}
