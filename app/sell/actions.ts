"use server";
// Saves a new listing. This runs on the server, so we check everything again
// even though the form already checked it: anyone could send a fake request.
import { createClient } from "@/lib/supabase/server";
import { validateListing, type ListingInput } from "@/lib/listings";

export async function createListing(input: ListingInput): Promise<{ id?: string; errors: string[] }> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) return { errors: ["Bạn cần đăng nhập để đăng bán."] };

  const result = validateListing(input);
  if (!result.ok) return { errors: result.errors };

  // Photos must be in the seller's own folder (the storage rules enforce this too).
  if (!result.listing.photo_paths.every((path) => path.startsWith(`${userId}/`))) {
    return { errors: ["Ảnh không hợp lệ."] };
  }

  const { data, error } = await supabase
    .from("listings")
    .insert(result.listing) // seller_id is filled in by the database
    .select("id")
    .single();

  if (error) {
    // Logged for us in the terminal; the seller gets a plain message.
    console.error("createListing failed:", error.message);
    return { errors: ["Không lưu được tin đăng. Vui lòng thử lại."] };
  }

  // The form sends the seller on to the new listing page.
  return { id: data.id, errors: [] };
}
