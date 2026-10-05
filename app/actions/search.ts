"use server";
// Suggestions shown under the search box while typing.
import { createClient } from "@/lib/supabase/server";
import { buildSuggestions, cleanQuery, type Suggestion } from "@/lib/search";

export async function getSuggestions(text: string): Promise<Suggestion[]> {
  const q = cleanQuery(text);
  if (q.length < 1) return [];
  const supabase = await createClient();
  const pattern = `"%${q}%"`;
  const { data } = await supabase
    .from("listings")
    .select("title, brand, category")
    .or(`title.ilike.${pattern},brand.ilike.${pattern}`)
    .limit(50);
  return buildSuggestions(q, data ?? []);
}
