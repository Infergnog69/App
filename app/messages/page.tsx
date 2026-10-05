// The inbox (/messages): "Tin nhắn" tab with chats, "Thông báo" tab with
// likes and demo orders on your items.
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfiles, getUnreadCounts, getUserId, photoUrl, type Supabase } from "@/lib/data";
import { formatPrice } from "@/lib/listings";
import { formatRelativeTime, initials } from "@/lib/format";
import EmptyState from "@/components/EmptyState";

type ListingBits = { title: string; price: number; photo_paths: string[]; seller_id: string };

async function getConversations(supabase: Supabase, userId: string) {
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id, last_message_at, listings (title, price, photo_paths, seller_id)")
    .order("last_message_at", { ascending: false })
    .limit(50);
  const list = conversations ?? [];

  // The latest message of each chat, for the preview line.
  const { data: messages } = await supabase
    .from("messages")
    .select("conversation_id, body, created_at")
    .in("conversation_id", list.map((c) => c.id))
    .order("created_at", { ascending: false })
    .limit(300);
  const latest = new Map<string, string>();
  for (const m of messages ?? []) if (!latest.has(m.conversation_id)) latest.set(m.conversation_id, m.body);

  const others = list.map((c) => (c.buyer_id === userId ? c.seller_id : c.buyer_id));
  const [profiles, unread] = await Promise.all([getProfiles(supabase, others), getUnreadCounts(supabase)]);

  return list.map((c, i) => ({
    id: c.id,
    name: profiles.get(others[i])?.display_name ?? "Thành viên newd",
    preview: latest.get(c.id) ?? `Về món: ${(c.listings as unknown as ListingBits | null)?.title ?? ""}`,
    at: c.last_message_at as string,
    unread: unread.get(c.id) ?? 0,
  }));
}

type Notice = { key: string; title: string; text: string; at: string; href: string; thumb: string };

async function getNotifications(supabase: Supabase, userId: string): Promise<Notice[]> {
  // Likes and demo orders on my listings ("!inner" keeps only rows whose
  // listing matches the filter), plus my own demo orders.
  const [likes, sales, purchases] = await Promise.all([
    supabase
      .from("favorites")
      .select("user_id, listing_id, created_at, listings!inner (title, price, photo_paths, seller_id)")
      .eq("listings.seller_id", userId)
      .neq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("demo_orders")
      .select("id, buyer_id, listing_id, total, created_at, listings!inner (title, price, photo_paths, seller_id)")
      .eq("listings.seller_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("demo_orders")
      .select("id, listing_id, total, created_at, listings (title, price, photo_paths, seller_id)")
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const actorIds = [...(likes.data ?? []).map((l) => l.user_id), ...(sales.data ?? []).map((s) => s.buyer_id)];
  const profiles = await getProfiles(supabase, actorIds);
  const nameOf = (id: string) => profiles.get(id)?.display_name ?? "Một thành viên";
  const thumb = (listing: unknown) => photoUrl(supabase, (listing as ListingBits).photo_paths[0]);
  const titleOf = (listing: unknown) => (listing as ListingBits).title;

  const notices: Notice[] = [
    ...(likes.data ?? []).map((l) => ({
      key: `like-${l.user_id}-${l.listing_id}`,
      title: `${nameOf(l.user_id)} đã thích món của bạn`,
      text: titleOf(l.listings),
      at: l.created_at,
      href: `/listings/${l.listing_id}`,
      thumb: thumb(l.listings),
    })),
    ...(sales.data ?? []).map((s) => ({
      key: `sale-${s.id}`,
      title: `${nameOf(s.buyer_id)} đã đặt đơn thử nghiệm`,
      text: `${titleOf(s.listings)} · ${formatPrice(s.total)}`,
      at: s.created_at,
      href: `/listings/${s.listing_id}`,
      thumb: thumb(s.listings),
    })),
    ...(purchases.data ?? []).filter((p) => p.listings).map((p) => ({
      key: `buy-${p.id}`,
      title: "Bạn đã tạo đơn thử nghiệm",
      text: `${titleOf(p.listings)} · ${formatPrice(p.total)}`,
      at: p.created_at,
      href: `/listings/${p.listing_id}`,
      thumb: thumb(p.listings),
    })),
  ];
  return notices.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 40);
}

export default async function MessagesPage({ searchParams }: PageProps<"/messages">) {
  const { tab } = await searchParams;
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) redirect("/login?message=" + encodeURIComponent("Đăng nhập để xem tin nhắn."));

  const showNotifications = tab === "notifications";
  const conversations = await getConversations(supabase, userId);
  const notifications = showNotifications ? await getNotifications(supabase, userId) : [];
  const unreadTotal = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <section className="screen active">
      <div className="inbox-list-view">
        <div className="activity-tabs" role="tablist">
          <Link href="/messages" className={`activity-tab${showNotifications ? "" : " active"}`} style={{ textDecoration: "none" }}>
            Tin nhắn
            {unreadTotal > 0 && <span className="activity-tab-count">{unreadTotal}</span>}
          </Link>
          <Link href="/messages?tab=notifications" className={`activity-tab${showNotifications ? " active" : ""}`} style={{ textDecoration: "none" }}>
            Thông báo
          </Link>
        </div>

        {!showNotifications ? (
          conversations.length > 0 ? (
            <div className="conversation-list">
              {conversations.map((c) => (
                <Link key={c.id} href={`/messages/${c.id}`} className="conversation-item">
                  <span className="avatar">{initials(c.name)}</span>
                  <span className="conversation-copy">
                    <strong>{c.name}</strong>
                    <span>{c.preview}</span>
                  </span>
                  <span className="conversation-meta">
                    <time>{formatRelativeTime(c.at)}</time>
                    {c.unread > 0 && <span className="unread-pill">{c.unread}</span>}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon="chat" title="Chưa có tin nhắn" text="Bấm “Nhắn tin” trên một món đồ để hỏi người bán." href="/" action="Khám phá món đồ" />
          )
        ) : notifications.length > 0 ? (
          <div className="notification-list">
            {notifications.map((n) => (
              <Link key={n.key} href={n.href} className="notification-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="notification-thumbnail" src={n.thumb} alt="" />
                <span className="notification-copy">
                  <strong>{n.title}</strong>
                  <span>{n.text}</span>
                  <time>{formatRelativeTime(n.at)}</time>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon="bell" title="Chưa có thông báo" text="Khi ai đó thích hoặc đặt mua món của bạn, bạn sẽ thấy ở đây." />
        )}
      </div>
    </section>
  );
}
