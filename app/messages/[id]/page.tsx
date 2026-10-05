// One chat, at /messages/<id>. Only the buyer and seller can open it
// (the database's security rules return nothing to anyone else).
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getUserId, photoUrl } from "@/lib/data";
import { formatPrice } from "@/lib/listings";
import { initials } from "@/lib/format";
import Icon from "@/components/Icon";
import ChatView from "@/components/ChatView";

type ListingBits = { id: string; title: string; price: number; photo_paths: string[] };

export default async function ChatPage({ params }: PageProps<"/messages/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) redirect("/login?message=" + encodeURIComponent("Đăng nhập để xem tin nhắn."));

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id, listings (id, title, price, photo_paths)")
    .eq("id", id)
    .maybeSingle();
  if (!conversation) notFound();

  const otherId = conversation.buyer_id === userId ? conversation.seller_id : conversation.buyer_id;
  const [other, { data: messages }] = await Promise.all([
    getProfile(supabase, otherId),
    supabase.from("messages").select("id, body, created_at, sender_id").eq("conversation_id", id).order("created_at").limit(500),
  ]);
  const listing = conversation.listings as unknown as ListingBits | null;
  const name = other?.display_name ?? "Thành viên newd";
  const role = conversation.seller_id === userId ? "Người mua" : "Người bán";

  return (
    <section className="screen active">
      <div className="chat-view" style={{ margin: "-12px -14px" }}>
        <header className="chat-header">
          <Link href="/messages" className="round-icon-button" aria-label="Quay lại">
            <Icon name="back" />
          </Link>
          <Link href={`/profile/${otherId}`} className="avatar small-avatar" style={{ textDecoration: "none" }}>
            {initials(name)}
          </Link>
          <div className="chat-person-copy">
            <strong>{name}</strong>
            <span>{role}</span>
          </div>
        </header>

        {listing && (
          <Link href={`/listings/${listing.id}`} className="chat-listing-strip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl(supabase, listing.photo_paths[0])} alt={listing.title} />
            <span className="chat-listing-copy">
              <strong>{listing.title}</strong>
              <span>{formatPrice(listing.price)}</span>
            </span>
            <Icon name="chevron" />
          </Link>
        )}

        <ChatView
          conversationId={id}
          messages={(messages ?? []).map((m) => ({ id: m.id, body: m.body, created_at: m.created_at, mine: m.sender_id === userId }))}
        />
      </div>
    </section>
  );
}
