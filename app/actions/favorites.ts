"use server";
// Like / unlike a listing (the heart button).
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/data";

export async function toggleFavorite(
  listingId: string,
): Promise<{ liked: boolean; count: number } | { needsLogin: true } | { error: string }> {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { needsLogin: true };

  const { data: existing } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", listingId)
    : await supabase.from("favorites").insert({ listing_id: listingId });
  if (error) {
    console.error("toggleFavorite:", error.message);
    return { error: "Chưa lưu được, vui lòng thử lại." };
  }

  // The database keeps the count up to date; read the new number back.
  const { data: listing } = await supabase.from("listings").select("like_count").eq("id", listingId).single();
  return { liked: !existing, count: listing?.like_count ?? 0 };
}
