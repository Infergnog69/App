"use client";
// The search box on /search, with live suggestions like the prototype.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSuggestions } from "@/app/actions/search";
import { searchHref, type SearchFilters, type Suggestion } from "@/lib/search";
import Icon from "./Icon";

export default function SearchBox({ filters }: { filters: SearchFilters }) {
  const router = useRouter();
  const [text, setText] = useState(filters.q);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);

  // Wait until the user pauses typing (250 ms) before asking for suggestions.
  useEffect(() => {
    const typed = text.trim();
    if (!typed || typed === filters.q) return;
    const timer = setTimeout(async () => setSuggestions(await getSuggestions(typed)), 250);
    return () => clearTimeout(timer);
  }, [text, filters.q]);

  function go(q: string) {
    setSuggestions(null);
    router.push(searchHref({ ...filters, q }));
  }

  const showPanel = suggestions !== null && text.trim() !== "" && text.trim() !== filters.q;

  return (
    <>
      <form
        className="real-search search-page-search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          go(text.trim());
        }}
      >
        <Icon name="search" />
        <input
          type="search"
          autoComplete="off"
          placeholder="Tìm món đồ hoặc thương hiệu"
          aria-label="Tìm kiếm"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (!event.target.value.trim()) setSuggestions(null);
          }}
        />
        {text && (
          <button type="button" aria-label="Xoá tìm kiếm" onClick={() => { setText(""); go(""); }}>
            <Icon name="close" />
          </button>
        )}
      </form>

      {showPanel && (
        <div className="search-suggestion-panel">
          {suggestions.length > 0 ? (
            suggestions.map((item) => (
              <button key={item.label} type="button" className="suggestion-row" onClick={() => { setText(item.label); go(item.label); }}>
                <span className="suggestion-copy">
                  <strong>{item.label}</strong>
                  <span>
                    {item.kind} · {item.count} món
                  </span>
                </span>
                <span className="suggestion-arrow">
                  <Icon name="chevron" />
                </span>
              </button>
            ))
          ) : (
            <div className="suggestion-empty">Tiếp tục nhập để tìm món đồ, thương hiệu hoặc danh mục phù hợp.</div>
          )}
        </div>
      )}
    </>
  );
}
