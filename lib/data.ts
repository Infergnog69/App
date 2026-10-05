// Database reads shared by several pages. Everything here runs on the server.
// Security rules (Row Level Security) in Supabase decide what each user may see.
import { createClient } from "@/lib/supabase/server";
import { PHOTO_BUCKET } from "@/lib/photos";
import type { SearchFilters } from "@/lib/search";

export type Supabase = Awaited<ReturnType<typeof createClient>>;

export type CardListing = {
  id: string;
  title: string;
  price: number;
  size: string;
  like_count: number;
  cover: string;
};

export type Profile = {
  id: string;
  display_name: string;
  username: string | null;
  location: string | null;
  bio: string | null;
};

const CARD_FIELDS = "id, title, price, size, like_count, photo_paths";

type CardRow = { id: string; title: string; price: number; size: string; like_count: number; photo_paths: string[] };

export function photoUrl(supabase: Supabase, path: string): string {
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

function toCards(supabase: Supabase, rows: CardRow[] | null): CardListing[] {
  return (rows ?? []).map(({ photo_paths, ...rest }) => ({ ...rest, cover: photoUrl(supabase, photo_paths[0]) }));
}

// The logged-in user's id, or null when logged out.
export async function getUserId(supabase: Supabase): Promise<string | null> {
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
}

export async function getFeed(supabase: Supabase, category: string | null): Promise<CardListing[]> {
  let query = supabase.from("listings").select(CARD_FIELDS).order("created_at", { ascending: false }).limit(40);
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) console.error("getFeed:", error.message);
  return toCards(supabase, data);
}

export async function searchListings(supabase: Supabase, filters: SearchFilters): Promise<CardListing[]> {
  let query = supabase.from("listings").select(CARD_FIELDS).limit(60);
  if (filters.q) {
    // The quotes keep the search text as plain text inside the filter.
    const pattern = `"%${filters.q}%"`;
    query = query.or(`title.ilike.${pattern},brand.ilike.${pattern},description.ilike.${pattern}`);
  }
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.size) query = query.eq("size", filters.size);
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.maxPrice) query = query.lte("price", filters.maxPrice);

  if (filters.sort === "newest") query = query.order("created_at", { ascending: false });
  else if (filters.sort === "priceLow") query = query.order("price", { ascending: true });
  else if (filters.sort === "priceHigh") query = query.order("price", { ascending: false });
  else query = query.order("like_count", { ascending: false }).order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) console.error("searchListings:", error.message);
  return toCards(supabase, data);
}

export async function getSellerListings(supabase: Supabase, sellerId: string): Promise<CardListing[]> {
  const { data } = await supabase
    .from("listings")
    .select(CARD_FIELDS)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  return toCards(supabase, data);
}

export async function getSavedListings(supabase: Supabase, userId: string): Promise<CardListing[]> {
  const { data } = await supabase
    .from("favorites")
    .select(`created_at, listings (${CARD_FIELDS})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  const rows = (data ?? []).flatMap((row) => (row.listings ? [row.listings as unknown as CardRow] : []));
  return toCards(supabase, rows);
}

// Which of these listings the user has liked (empty when logged out).
export async function getLikedIds(supabase: Supabase, userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", userId);
  return new Set((data ?? []).map((row) => row.listing_id as string));
}

export async function getProfile(supabase: Supabase, id: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, username, location, bio")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getProfiles(supabase: Supabase, ids: string[]): Promise<Map<string, Profile>> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return new Map();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, username, location, bio")
    .in("id", unique);
  return new Map((data ?? []).map((profile) => [profile.id, profile]));
}

// Unread messages per conversation for the logged-in user.
export async function getUnreadCounts(supabase: Supabase): Promise<Map<string, number>> {
  const { data, error } = await supabase.rpc("unread_counts");
  if (error) return new Map();
  return new Map((data as { conversation_id: string; unread: number }[]).map((r) => [r.conversation_id, r.unread]));
}
