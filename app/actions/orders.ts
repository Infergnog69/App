"use server";
// "Mua ngay" in test mode: records a demo order. No real payment happens.
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/data";

export async function placeDemoOrder(listingId: string): Promise<{ ok: true; total: number } | { needsLogin: true } | { error: string }> {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { needsLogin: true };

  // The database fills in the prices from the listing itself.
  const { data, error } = await supabase.from("demo_orders").insert({ listing_id: listingId }).select("total").single();
  if (error) {
    console.error("placeDemoOrder:", error.message);
    return { error: "Chưa tạo được đơn thử nghiệm." };
  }
  return { ok: true, total: data.total };
}
