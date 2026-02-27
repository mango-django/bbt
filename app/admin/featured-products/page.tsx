"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

/* -------------------------------------------------------
   Types
------------------------------------------------------- */
type ProductOption = {
  id: string;
  title: string | null;
  status: string | null;
  price_per_m2: string | null;
  price_per_box: string | null;
  product_images?: { url: string | null; sort_order?: number | null }[] | null;
};

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
function formatGBP(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(n);
}

function getThumb(product: ProductOption) {
  const imgs = [...(product.product_images ?? [])].sort(
    (a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99)
  );
  return imgs[0]?.url ?? null;
}

/* -------------------------------------------------------
   Page
------------------------------------------------------- */
export default function FeaturedProductsPage() {
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /* ---- Initial load ---- */
  useEffect(() => {
    async function load() {
      try {
        // Load all products
        const prodRes = await fetch("/api/admin/products/list", {
          cache: "no-store",
        });
        const prodJson = await prodRes.json();

        // Load current featured IDs
        const featRes = await fetch("/api/admin/featured-products", {
          cache: "no-store",
        });
        const featJson = await featRes.json();

        setAllProducts(prodJson.products ?? []);
        setSelectedIds(featJson.ids ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ---- Derived ---- */
  const selectedProducts = selectedIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as ProductOption[];

  const filteredProducts = allProducts.filter((p) => {
    if (selectedIds.includes(p.id)) return false; // already selected
    if (p.status !== "active") return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.title?.toLowerCase().includes(q);
  });

  /* ---- Actions ---- */
  function addProduct(id: string) {
    if (selectedIds.length >= 4) return;
    setSelectedIds((prev) => [...prev, id]);
  }

  function removeProduct(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setSelectedIds((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    if (index === selectedIds.length - 1) return;
    setSelectedIds((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/admin/featured-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error ?? "Save failed");
      setSaveMessage({ type: "success", text: "Featured products saved successfully." });
    } catch (err: any) {
      setSaveMessage({ type: "error", text: err?.message ?? "Failed to save." });
    } finally {
      setSaving(false);
    }
  }

  /* ---- Render ---- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">Featured Products</h1>
        <p className="text-gray-600 mt-1">
          Select up to <strong>4 products</strong> to display in the
          &ldquo;Latest Products&rdquo; section on the homepage. Drag-to-reorder
          is done via the arrow buttons.
        </p>
      </div>

      {/* Save feedback */}
      {saveMessage && (
        <div
          className={`px-4 py-3 rounded text-sm ${
            saveMessage.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* ---- Selected products ---- */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Selected ({selectedIds.length} / 4)
        </h2>

        {selectedIds.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400">
            No products selected. Search below and click a product to add it.
          </div>
        ) : (
          <div className="space-y-2">
            {selectedProducts.map((product, idx) => {
              const thumb = getThumb(product);
              const price =
                formatGBP(product.price_per_m2) ??
                formatGBP(product.price_per_box) ??
                "—";

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-4 bg-white border rounded-lg p-3 shadow-sm"
                >
                  {/* position badge */}
                  <span className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </span>

                  {/* thumbnail */}
                  {thumb ? (
                    <div className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                      <Image src={thumb} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 flex-shrink-0 rounded bg-gray-100" />
                  )}

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {product.title ?? "Untitled"}
                    </p>
                    <p className="text-xs text-gray-500">{price} per m²</p>
                  </div>

                  {/* reorder buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-25 transition-colors"
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === selectedIds.length - 1}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-25 transition-colors"
                      title="Move down"
                    >
                      ▼
                    </button>
                  </div>

                  {/* remove */}
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="ml-2 text-red-400 hover:text-red-600 transition-colors text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-md font-medium transition-colors"
      >
        {saving ? "Saving…" : "Save Featured Products"}
      </button>

      {/* ---- Product browser ---- */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Browse Products</h2>

        {selectedIds.length >= 4 && (
          <p className="mb-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            You have selected the maximum of 4 products. Remove one above to add
            a different product.
          </p>
        )}

        {/* search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name…"
          className="w-full border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        {filteredProducts.length === 0 ? (
          <p className="text-gray-400 text-sm italic">
            {search ? "No matching products found." : "All active products are already selected."}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.slice(0, 40).map((product) => {
              const thumb = getThumb(product);
              const price =
                formatGBP(product.price_per_m2) ??
                formatGBP(product.price_per_box) ??
                "—";
              const canAdd = selectedIds.length < 4;

              return (
                <button
                  key={product.id}
                  onClick={() => canAdd && addProduct(product.id)}
                  disabled={!canAdd}
                  className={`group text-left border rounded-lg overflow-hidden bg-white shadow-sm transition-all ${
                    canAdd
                      ? "hover:shadow-md hover:border-blue-400 cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  {/* thumbnail */}
                  <div className="relative w-full bg-gray-100" style={{ aspectRatio: "1/1" }}>
                    {thumb ? (
                      <Image src={thumb} alt="" fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">
                        No image
                      </div>
                    )}
                    {canAdd && (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-600/0 group-hover:bg-blue-600/80 transition-colors duration-200">
                        <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                          +
                        </span>
                      </div>
                    )}
                  </div>

                  {/* info */}
                  <div className="p-2">
                    <p className="text-xs font-medium truncate text-gray-800">
                      {product.title ?? "Untitled"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{price}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
