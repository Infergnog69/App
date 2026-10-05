// Turns the address bar (?q=...&category=...) into search filters, and builds
// the "did you mean" suggestions shown while typing. No database code here,
// so it can be tested on its own.
import { CATEGORIES, CONDITIONS, SIZES, categoryLabel } from "./listings";

export const PRICE_SLIDER_MIN = 100_000;
export const PRICE_SLIDER_MAX = 1_000_000; // the slider's top end means "no limit"
export const PRICE_SLIDER_STEP = 50_000;

export const SORTS = [
  { id: "recommended", label: "Gợi ý" },
  { id: "newest", label: "Mới đăng" },
  { id: "priceLow", label: "Giá thấp" },
  { id: "priceHigh", label: "Giá cao" },
] as const;

export type SortId = (typeof SORTS)[number]["id"];

export type SearchFilters = {
  q: string;
  category: string | null;
  size: string | null;
  condition: string | null;
  maxPrice: number | null; // null = no limit
  sort: SortId;
};

type Params = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

// Removes characters that have a special meaning in database search filters,
// so typing "%" or "," can't break (or bend) the query.
export function cleanQuery(text: string): string {
  return text.replace(/[%_,()*\\"]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

export function parseSearchFilters(params: Params): SearchFilters {
  const category = first(params.category);
  const size = first(params.size);
  const condition = first(params.condition);
  const sort = first(params.sort);
  const max = Number(first(params.max));

  return {
    q: cleanQuery(first(params.q)),
    category: CATEGORIES.some((c) => c.id === category) ? category : null,
    size: (SIZES as readonly string[]).includes(size) ? size : null,
    condition: (CONDITIONS as readonly string[]).includes(condition) ? condition : null,
    maxPrice: Number.isInteger(max) && max >= PRICE_SLIDER_MIN && max < PRICE_SLIDER_MAX ? max : null,
    sort: SORTS.some((s) => s.id === sort) ? (sort as SortId) : "recommended",
  };
}

// True when the user has searched or filtered anything (so we show results
// instead of the category cards).
export function hasActiveSearch(filters: SearchFilters): boolean {
  return Boolean(filters.q || filters.category || filters.size || filters.condition || filters.maxPrice);
}

// Builds a link to /search with these filters, leaving out empty ones.
export function searchHref(filters: Partial<SearchFilters>): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.size) params.set("size", filters.size);
  if (filters.condition) params.set("condition", filters.condition);
  if (filters.maxPrice) params.set("max", String(filters.maxPrice));
  if (filters.sort && filters.sort !== "recommended") params.set("sort", filters.sort);
  const text = params.toString();
  return text ? `/search?${text}` : "/search";
}

export type Suggestion = { label: string; kind: string; count: number };

// Like the prototype: matching titles and brands, each with how many items
// contain it. At most 8.
export function buildSuggestions(
  query: string,
  listings: { title: string; brand: string | null; category: string }[],
): Suggestion[] {
  const needle = query.trim().toLocaleLowerCase("vi-VN");
  if (!needle) return [];

  const haystacks = listings.map((l) => `${l.title} ${l.brand ?? ""}`.toLocaleLowerCase("vi-VN"));
  const seen = new Set<string>();
  const suggestions: Suggestion[] = [];

  for (const listing of listings) {
    const candidates = [
      { label: listing.title, kind: categoryLabel(listing.category) },
      ...(listing.brand ? [{ label: listing.brand, kind: "Thương hiệu" }] : []),
    ];
    for (const { label, kind } of candidates) {
      const normalized = label.trim().toLocaleLowerCase("vi-VN");
      if (!normalized.includes(needle) || seen.has(normalized)) continue;
      seen.add(normalized);
      const count = haystacks.filter((text) => text.includes(normalized)).length;
      suggestions.push({ label: label.trim(), kind, count });
      if (suggestions.length >= 8) return suggestions;
    }
  }
  return suggestions;
}
