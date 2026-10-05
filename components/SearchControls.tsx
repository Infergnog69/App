"use client";
// The results row on /search: number of items, sort menu, and the filter
// button that opens the bottom sheet (size, condition, max price).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CONDITIONS, SIZES, formatPrice } from "@/lib/listings";
import {
  PRICE_SLIDER_MAX,
  PRICE_SLIDER_MIN,
  PRICE_SLIDER_STEP,
  SORTS,
  searchHref,
  type SearchFilters,
  type SortId,
} from "@/lib/search";
import Icon from "./Icon";

export default function SearchControls({ filters, count }: { filters: SearchFilters; count: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(filters.size);
  const [condition, setCondition] = useState(filters.condition);
  const [max, setMax] = useState(filters.maxPrice ?? PRICE_SLIDER_MAX);

  const filterCount = [filters.size, filters.condition, filters.maxPrice].filter(Boolean).length;

  function apply() {
    setOpen(false);
    router.push(searchHref({ ...filters, size, condition, maxPrice: max < PRICE_SLIDER_MAX ? max : null }));
  }

  function reset() {
    setSize(null);
    setCondition(null);
    setMax(PRICE_SLIDER_MAX);
  }

  return (
    <>
      <div className="results-row">
        <strong>{count} món đồ</strong>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            aria-label="Sắp xếp"
            value={filters.sort}
            onChange={(event) => router.push(searchHref({ ...filters, sort: event.target.value as SortId }))}
          >
            {SORTS.map((sort) => (
              <option key={sort.id} value={sort.id}>
                {sort.label}
              </option>
            ))}
          </select>
          <button type="button" className="round-icon-button" aria-label="Bộ lọc" onClick={() => setOpen(true)}>
            <Icon name="filter" />
            {filterCount > 0 && <span className="active-filter-dot" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="bottom-sheet-modal">
          <button className="modal-scrim" type="button" aria-label="Đóng bộ lọc" onClick={() => setOpen(false)} />
          <section className="bottom-sheet" aria-label="Bộ lọc">
            <div className="sheet-grabber" />
            <div className="sheet-header">
              <h2>Bộ lọc</h2>
              <button className="text-link" type="button" onClick={reset}>
                Đặt lại
              </button>
            </div>

            <div className="filter-group">
              <label>Kích thước</label>
              <div className="choice-chip-wrap">
                {SIZES.map((s) => (
                  <button key={s} type="button" className={`choice-chip${size === s ? " active" : ""}`} onClick={() => setSize(size === s ? null : s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Tình trạng</label>
              <div className="choice-chip-wrap">
                {CONDITIONS.map((c) => (
                  <button key={c} type="button" className={`choice-chip${condition === c ? " active" : ""}`} onClick={() => setCondition(condition === c ? null : c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-label-row">
                <label htmlFor="filterPrice">Giá tối đa</label>
                <strong>{max >= PRICE_SLIDER_MAX ? "Không giới hạn" : formatPrice(max)}</strong>
              </div>
              <input
                id="filterPrice"
                className="range-input"
                type="range"
                min={PRICE_SLIDER_MIN}
                max={PRICE_SLIDER_MAX}
                step={PRICE_SLIDER_STEP}
                value={max}
                onChange={(event) => setMax(Number(event.target.value))}
              />
            </div>

            <button className="primary-button" type="button" onClick={apply}>
              Xem kết quả
            </button>
          </section>
        </div>
      )}
    </>
  );
}
