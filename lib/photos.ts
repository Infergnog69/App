// Photo helpers.
import { createClient } from "@/lib/supabase/server";

export const PHOTO_BUCKET = "listing-photos";

// Turns a stored photo path into a web address anyone can open.
export async function photoUrl(path: string): Promise<string> {
  const supabase = await createClient();
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}
