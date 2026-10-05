// The search page (/search). Everything you pick is kept in the address bar
// (e.g. /search?q=áo&size=M), so results can be shared or bookmarked.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLikedIds, getUserId, searchListings } from "@/lib/data";
import { CATEGORIES } from "@/lib/listings";
import { hasActiveSearch, parseSearchFilters, searchHref } from "@/lib/search";
import Icon, { type IconName } from "@/components/Icon";
import ListingGrid from "@/components/ListingGrid";
import SearchBox from "@/components/SearchBox";
import SearchControls from "@/components/SearchControls";
import EmptyState from "@/components/EmptyState";

const CATEGORY_ICONS: Record<string, IconName> = {
  women: "dress",
  men: "shirt",
  shoes: "shoe",
  accessories: "glasses",
  designer: "bag",
  vintage: "bag",
  kids: "dress",
};

// Same order as the prototype's browse cards.
const BROWSE_ORDER = ["women", "men", "shoes", "accessories", "designer", "vintage", "kids"];

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const filters = parseSearchFilters(await searchParams);
  const active = hasActiveSearch(filters);

  const supabase = await createClient();
  const userId = await getUserId(supabase);
  const [results, likedIds] = active
    ? await Promise.all([searchListings(supabase, filters), getLikedIds(supabase, userId)])
    : [[], new Set<string>()];

  return (
    <section className="screen active">
      {/* key: start the box fresh when the search in the address bar changes */}
      <SearchBox key={filters.q} filters={filters} />

      {filters.category && (
        <div className="filter-chip-rail">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={searchHref({ ...filters, category: c.id === filters.category ? null : c.id })}
              className={`filter-chip${c.id === filters.category ? " active" : ""}`}
              style={{ textDecoration: "none" }}
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}

      {!active ? (
        <div className="search-browse-grid" aria-label="Khám phá danh mục">
          {BROWSE_ORDER.map((id) => (
            <Link key={id} href={searchHref({ category: id })} className="browse-card" style={{ textDecoration: "none" }}>
              <span className="browse-card-title">{CATEGORIES.find((c) => c.id === id)?.label}</span>
              <span className="browse-card-icon">
                <Icon name={CATEGORY_ICONS[id]} />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <>
          <SearchControls key={searchHref(filters)} filters={filters} count={results.length} />
          {results.length > 0 ? (
            <ListingGrid listings={results} likedIds={likedIds} />
          ) : (
            <EmptyState
              icon="search"
              title="Chưa tìm thấy món phù hợp"
              text="Thử đổi từ khoá hoặc chọn một danh mục khác."
              href="/search"
              action="Đặt lại"
            />
          )}
        </>
      )}
    </section>
  );
}
