import { describe, expect, it } from "vitest";
import { buildSuggestions, cleanQuery, hasActiveSearch, parseSearchFilters, searchHref } from "./search";

describe("cleanQuery", () => {
  it("removes characters that could bend the database filter", () => {
    expect(cleanQuery("áo,len%)(")).toBe("áo len");
    expect(cleanQuery("  quần   jean ")).toBe("quần jean");
    expect(cleanQuery('say "hi"')).toBe("say hi");
  });

  it("keeps apostrophes and dots, which are safe", () => {
    expect(cleanQuery("Levi's 501.")).toBe("Levi's 501.");
  });
});

describe("parseSearchFilters", () => {
  it("reads valid filters from the address bar", () => {
    const filters = parseSearchFilters({
      q: "cardigan",
      category: "women",
      size: "S",
      condition: "Rất tốt",
      max: "300000",
      sort: "priceLow",
    });
    expect(filters).toEqual({
      q: "cardigan",
      category: "women",
      size: "S",
      condition: "Rất tốt",
      maxPrice: 300000,
      sort: "priceLow",
    });
  });

  it("ignores values that aren't allowed", () => {
    const filters = parseSearchFilters({ category: "cars", size: "XXXL", max: "-5", sort: "random" });
    expect(filters.category).toBeNull();
    expect(filters.size).toBeNull();
    expect(filters.maxPrice).toBeNull();
    expect(filters.sort).toBe("recommended");
  });

  it("treats the top of the price slider as no limit", () => {
    expect(parseSearchFilters({ max: "1000000" }).maxPrice).toBeNull();
  });
});

describe("hasActiveSearch and searchHref", () => {
  it("knows when nothing is searched", () => {
    expect(hasActiveSearch(parseSearchFilters({}))).toBe(false);
    expect(searchHref({})).toBe("/search");
  });
  it("round-trips filters through a link", () => {
    const href = searchHref({ q: "áo", category: "men", sort: "newest" });
    const params = Object.fromEntries(new URL(href, "http://x").searchParams);
    expect(parseSearchFilters(params)).toMatchObject({ q: "áo", category: "men", sort: "newest" });
  });
});

describe("buildSuggestions", () => {
  const listings = [
    { title: "Áo khoác denim", brand: "Levi's", category: "men" },
    { title: "Áo len hồng", brand: null, category: "women" },
    { title: "Quần jean", brand: "Levi's", category: "men" },
  ];

  it("suggests matching titles and brands with counts", () => {
    expect(buildSuggestions("lev", listings)).toEqual([{ label: "Levi's", kind: "Thương hiệu", count: 2 }]);
  });

  it("is case-insensitive and skips duplicates", () => {
    const labels = buildSuggestions("ÁO", listings).map((s) => s.label);
    expect(labels).toEqual(["Áo khoác denim", "Áo len hồng"]);
  });

  it("returns nothing for an empty query", () => {
    expect(buildSuggestions("  ", listings)).toEqual([]);
  });
});
