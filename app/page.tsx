// The home page ("/"): category pills and the newest listings.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFeed, getLikedIds, getUserId } from "@/lib/data";
import ListingGrid from "@/components/ListingGrid";
import EmptyState from "@/components/EmptyState";

// The pills shown on the home page, as in the prototype.
const HOME_CATEGORIES = [
  { id: null, label: "Tất cả" },
  { id: "women", label: "Nữ" },
  { id: "men", label: "Nam" },
  { id: "accessories", label: "Phụ kiện" },
  { id: "shoes", label: "Giày dép" },
];

export default async function Home({ searchParams }: PageProps<"/">) {
  const { category: picked } = await searchParams;
  const category = HOME_CATEGORIES.find((c) => c.id === picked)?.id ?? null;

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  const [listings, likedIds] = await Promise.all([getFeed(supabase, category), getLikedIds(supabase, userId)]);

  return (
    <section className="screen active">
      <div className="compact-category-rail" aria-label="Danh mục">
        {HOME_CATEGORIES.map((c) => (
          <Link
            key={c.label}
            href={c.id ? `/?category=${c.id}` : "/"}
            className={`category-pill${c.id === category ? " active" : ""}`}
            style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
          >
            {c.label}
          </Link>
        ))}
      </div>

      <h2 className="home-section-title">Dành riêng cho bạn</h2>

      {listings.length > 0 ? (
        <ListingGrid listings={listings} likedIds={likedIds} />
      ) : (
        <EmptyState
          icon="sparkles"
          title="Chưa có món đồ nào"
          text="Hãy là người đầu tiên đăng bán món đồ của bạn."
          href="/sell"
          action="Đăng món đầu tiên"
        />
      )}
    </section>
  );
}
