"use client";

import ProductSearch from "@/components/admin/ProductSearch";
import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  title: string | null;
  display_id?: string | null;
  supplier_id?: string | null;
  status: string | null;
  dimension_string?: string | null;
  tile_width_mm?: number | null;
  tile_height_mm?: number | null;
  price_per_m2: string | null;
  price_per_box: string | null;
  boxes_in_stock: string | number | null;
  created_at: string | null;
};

const PAGE_SIZE = 500;

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Master list
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); // Display list
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const hasMore = total !== null && allProducts.length < total;

  function applySearch(products: Product[], term: string) {
    const normalized = term.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((p) =>
      p.title?.toLowerCase().includes(normalized) ||
      p.display_id?.toLowerCase().includes(normalized) ||
      p.supplier_id?.toLowerCase().includes(normalized)
    );
  }

  async function fetchPage(offset: number): Promise<{ products: Product[]; total: number; hasMore: boolean }> {
    const res = await fetch(`/api/admin/products/list?offset=${offset}&limit=${PAGE_SIZE}`, {
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Failed to load products");
    return { products: json.products ?? [], total: json.total ?? 0, hasMore: !!json.hasMore };
  }

  useEffect(() => {
    async function loadProducts() {
      try {
        const page = await fetchPage(0);
        setAllProducts(page.products);
        setFilteredProducts(page.products);
        setTotal(page.total);
      } catch (err: any) {
        setError(err?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  async function loadMore(all = false) {
    if (loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      let current = allProducts;
      let more = true;
      do {
        const page = await fetchPage(current.length);
        // de-dupe on id in case rows shifted between requests
        const seen = new Set(current.map((p) => p.id));
        current = [...current, ...page.products.filter((p) => !seen.has(p.id))];
        setAllProducts(current);
        setFilteredProducts(applySearch(current, searchTerm));
        setTotal(page.total);
        more = page.hasMore;
      } while (all && more);
    } catch (err: any) {
      setError(err?.message || "Failed to load more products");
    } finally {
      setLoadingMore(false);
    }
  }

  // SEARCH LOGIC
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilteredProducts(applySearch(allProducts, term));
  };

  async function handleDelete(productId: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleteError(null);
    setDeletingId(productId);

    try {
      const res = await fetch(`/api/admin/products/${productId}/delete`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error || "Failed to delete product");
      
      // Remove from both lists
      setAllProducts((prev) => prev.filter((p) => p.id !== productId));
      setFilteredProducts((prev) => prev.filter((p) => p.id !== productId));
      setTotal((prev) => (prev === null ? prev : prev - 1));
    } catch (err: any) {
      setDeleteError(err?.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(value?: string | null) {
    if (!value) return "—";
    try { return new Date(value).toLocaleDateString(); } catch { return value; }
  }

  function formatGBP(value?: string | number | null) {
    if (value === null || value === undefined || value === "") return "—";
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return "—";
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
    }).format(parsed);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600">Review, edit, and create products.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {total === null
              ? `${allProducts.length} loaded`
              : hasMore
                ? `${allProducts.length} of ${total} loaded`
                : `${total} total`}
          </span>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            + New Product
          </Link>
        </div>
      </div>

      {/* 🔍 SEARCH COMPONENT WITH DROPDOWN */}
      {!loading && (
        <div className="space-y-2">
          <ProductSearch
            products={allProducts}
            onSearch={handleSearch}
            onSelect={(id) => { /* Handle direct selection if needed */ }}
          />
          {hasMore && searchTerm.trim() && (
            <p className="text-xs text-amber-700">
              Searching the {allProducts.length} loaded products only —{" "}
              <button
                onClick={() => loadMore(true)}
                disabled={loadingMore}
                className="underline hover:text-amber-900 disabled:opacity-50"
              >
                load all {total}
              </button>{" "}
              to search everything.
            </p>
          )}
        </div>
      )}

      {loading && <p>Loading products…</p>}
      {error && <p className="p-4 bg-red-50 text-red-700 border border-red-200 rounded">{error}</p>}
      {deleteError && <p className="p-4 bg-red-50 text-red-700 border border-red-200 rounded">{deleteError}</p>}

      {!loading && filteredProducts.length === 0 && (
        <p className="text-gray-600 italic">No products found.</p>
      )}

      {!loading && filteredProducts.length > 0 && (
        <div className="overflow-x-auto rounded border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Front-End Display ID</th>
                <th className="px-4 py-3">Supplier ID (Internal)</th>
                <th className="px-4 py-3">Dimensions</th>
                <th className="px-4 py-3">Price / m²</th>
                <th className="px-4 py-3 w-24">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{product.title || "Untitled"}</td>
                  <td className="px-4 py-3 text-gray-700">{product.display_id || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{product.supplier_id || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{product.dimension_string || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{formatGBP(product.price_per_m2)}</td>
                  <td className="px-4 py-3 text-gray-700">{product.boxes_in_stock ?? "—"}</td>
                  <td className="px-4 py-3 capitalize text-gray-700">{product.status || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(product.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:underline disabled:opacity-50"
                        disabled={deletingId === product.id}
                      >
                        {deletingId === product.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && hasMore && !searchTerm.trim() && (
        <div className="flex items-center justify-center gap-4 py-2">
          <button
            onClick={() => loadMore(false)}
            disabled={loadingMore}
            className="rounded-md border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : `Load ${Math.min(PAGE_SIZE, (total ?? 0) - allProducts.length)} more`}
          </button>
          <button
            onClick={() => loadMore(true)}
            disabled={loadingMore}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
          >
            Load all {total}
          </button>
        </div>
      )}
    </div>
  );
}
