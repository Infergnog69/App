"use server";
// Messaging between buyer and seller.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/data";

// "Nhắn tin" on a listing: open the existing chat, or start a new one.
export async function startConversation(listingId: string) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) redirect("/login?message=" + encodeURIComponent("Đăng nhập để nhắn tin với người bán."));

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", userId)
    .maybeSingle();
  if (existing) redirect(`/messages/${existing.id}`);

  const { data: listing } = await supabase.from("listings").select("seller_id").eq("id", listingId).single();
  if (!listing || listing.seller_id === userId) redirect(`/listings/${listingId}`);

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ listing_id: listingId, seller_id: listing.seller_id })
    .select("id")
    .single();
  if (error) {
    console.error("startConversation:", error.message);
    redirect(`/listings/${listingId}`);
  }
  redirect(`/messages/${created.id}`);
}

export async function sendMessage(conversationId: string, text: string): Promise<{ error?: string }> {
  const body = text.trim();
  if (!body) return {};
  if (body.length > 500) return { error: "Tin nhắn tối đa 500 ký tự." };

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({ conversation_id: conversationId, body });
  if (error) {
    console.error("sendMessage:", error.message);
    return { error: "Chưa gửi được tin nhắn, vui lòng thử lại." };
  }
  revalidatePath(`/messages/${conversationId}`);
  return {};
}

// Called when a chat is open, so its messages stop counting as unread.
export async function markConversationRead(conversationId: string) {
  const supabase = await createClient();
  await supabase.rpc("mark_conversation_read", { conversation: conversationId });
}
