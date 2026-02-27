"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import FiltersSidebar from "@/app/category/[slug]/FiltersSidebar";
import FiltersDrawer from "@/app/category/[slug]/FiltersDrawer";
import ProductCard from "@/app/category/[slug]/ProductCard";

/* -------------------------------------------------------
   Constants
------------------------------------------------------- */
const BASE_PATH = "/tiles";
const PAGE_SIZE = 24;

/* -------------------------------------------------------
   Types
------------------------------------------------------- */
type Product = {
  id: string;
  title: string | null;
  slug: string | null;
  dimension_string: string | null;
  price_per_m2: string | null;
  price_per_box: string | null;
  product_images: { id: string; url: string | null; sort_order: number | null }[];
};

/* -------------------------------------------------------
   Grid SVG icons
------------------------------------------------------- */
function GridIcon2() {
  return (
    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="0" y="0" width="10" height="6" /><rect x="14" y="0" width="10" height="6" />
      <rect x="0" y="10" width="10" height="6" /><rect x="14" y="10" width="10" height="6" />
    </svg>
  );
}
function GridIcon3() {
  return (
    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="0" y="0" width="6" height="6" /><rect x="9" y="0" width="6" height="6" /><rect x="18" y="0" width="6" height="6" />
      <rect x="0" y="10" width="6" height="6" /><rect x="9" y="10" width="6" height="6" /><rect x="18" y="10" width="6" height="6" />
    </svg>
  );
}
function GridIcon4() {
  return (
    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="0" width="4" height="6" /><rect x="7" y="0" width="4" height="6" /><rect x="13" y="0" width="4" height="6" /><rect x="19" y="0" width="4" height="6" />
      <rect x="1" y="10" width="4" height="6" /><rect x="7" y="10" width="4" height="6" /><rect x="13" y="10" width="4" height="6" /><rect x="19" y="10" width="4" height="6" />
    </svg>
  );
}

/* -------------------------------------------------------
   Component
------------------------------------------------------- */
export default function AllTilesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const sentinelRef = useRef<HTMLDivElement>(null);
  // Synchronous flag so the observer always reads the latest value
  const loadingRef = useRef(false);
  // Increments whenever filters change; stale fetches are discarded when they complete
  const sessionRef = useRef(0);

  /* ---- Derived: filter string (grid is UI-only, not a filter) ---- */
  const filtersKey = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("grid");
    return p.toString();
  })();

  const grid = searchParams.get("grid") ?? "3";
  const gridCols =
    grid === "2" ? "lg:grid-cols-2" : grid === "4" ? "lg:grid-cols-4" : "lg:grid-cols-3";
  const sort = searchParams.get("sort") ?? "default";

  /* ---- Top-bar controls ---- */
  function updateParam(key: string, value: string | null) {
    const p = new URLSearchParams(searchParams.toString());
    if (!value) p.delete(key);
    else p.set(key, value);
    router.push(`${BASE_PATH}?${p.toString()}`);
  }

  /* ---- Core fetch function ---- */
  async function loadPage(pageNum: number, filters: string, session: number) {
    loadingRef.current = true;
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      params.set("page", String(pageNum));
      params.set("pageSize", String(PAGE_SIZE));

      const res = await fetch(`/api/public/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();

      // Discard if a newer session has started (filters changed mid-flight)
      if (session !== sessionRef.current) return;

      const incoming: Product[] = json.products ?? [];

      if (pageNum === 1) {
        setProducts(incoming);
      } else {
        // Deduplicate by ID — guards against any remaining race conditions
        setProducts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...incoming.filter((p) => !seen.has(p.id))];
        });
      }
      setTotal(json.total ?? 0);
      setHasMore(json.hasMore ?? false);
    } catch (err) {
      if (session === sessionRef.current) {
        console.error(err);
        setHasMore(false);
      }
    } finally {
      if (session === sessionRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }

  /* ---- Effect: filter changes → reset and fetch page 1 ---- */
  useEffect(() => {
    sessionRef.current += 1;
    const session = sessionRef.current;
    setProducts([]);
    setPage(1);
    setHasMore(true);
    loadPage(1, filtersKey, session);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  /* ---- Effect: page > 1 increments → fetch next page ---- */
  useEffect(() => {
    if (page === 1) return; // page 1 is always handled by the filter effect above
    loadPage(page, filtersKey, sessionRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  /* ---- IntersectionObserver — reads loadingRef synchronously ---- */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          // Set the ref immediately so subsequent observer callbacks are blocked
          loadingRef.current = true;
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]); // no longer depends on `loading` state — uses ref instead

  /* ---- Render ---- */
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Mobile filter drawer */}
      <FiltersDrawer categorySlug="" basePath={BASE_PATH} />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12">
        {/* Desktop sidebar — sticky */}
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <FiltersSidebar categorySlug="" basePath={BASE_PATH} />
          </div>
        </aside>

        {/* Main content */}
        <section>

          {/* Top bar */}
          <div className="flex flex-wrap justify-between items-end gap-4 pb-5 border-b border-[#E8E5E0]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-light tracking-wider text-[#1A1A1A]">All Tiles</h2>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mt-1.5">
                {loading && products.length === 0
                  ? "Loading…"
                  : `${products.length}${total > 0 ? ` of ${total}` : ""} products`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              {/* Sort */}
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] shrink-0">Sort</span>
                <div className="relative">
                <select
                  className="appearance-none bg-transparent border-0 border-b border-[#D4CFC8] py-1.5 pr-7 pl-0 text-xs tracking-wide text-[#1A1A1A] focus:outline-none focus:border-[#9A7A5E] cursor-pointer transition-colors duration-200"
                  value={sort}
                  onChange={(e) => updateParam("sort", e.target.value)}
                >
                  <option value="default">Newest</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
                <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#9A7A5E]">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                </div>
              </div>

              {/* Grid toggles */}
              <div className="flex items-center gap-1">
                {(["2", "3", "4"] as const).map((g) => (
                  <button
                    key={g}
                    className={`w-8 h-8 flex items-center justify-center border transition-all duration-200
                      ${grid === g
                        ? "border-[#9A7A5E] bg-[#9A7A5E] text-white"
                        : "border-[#E8E5E0] text-[#A0A0A0] hover:border-[#9A7A5E] hover:text-[#9A7A5E]"
                      }`}
                    onClick={() => updateParam("grid", g)}
                    title={`${g} columns`}
                    aria-label={`${g} column view`}
                  >
                    {g === "2" ? <GridIcon2 /> : g === "3" ? <GridIcon3 /> : <GridIcon4 />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product grid */}
          {products.length > 0 && (
            <div className={`mt-8 grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-x-6 gap-y-10`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && products.length === 0 && (
            <div className="mt-16 text-center">
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#9A7A5E] mb-2">No results</p>
              <p className="text-sm text-[#6B6B6B]">Try adjusting or clearing your filters.</p>
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="mt-10 flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-[#E8E5E0] border-t-[#9A7A5E] animate-spin" />
            </div>
          )}

          {/* End of results */}
          {!hasMore && products.length > 0 && !loading && (
            <p className="mt-10 text-center text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E]">
              All {total} products loaded
            </p>
          )}

          {/* Scroll sentinel */}
          <div ref={sentinelRef} className="h-1" />
        </section>
        </div>
      </div>
    </div>
  );
}
