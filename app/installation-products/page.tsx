import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tile Installation Products",
  description:
    "Adhesives, grouts, levelling systems and everything you need to install tiles — delivered across the UK by Bellos Bespoke Tiles.",
  alternates: { canonical: "/installation-products" },
};
import InstallationProductCard from "@/app/installation-products/components/InstallationProductCard";
import InstallationFilters from "@/app/installation-products/components/InstallationFilters";
import InstallationSearch from "@/app/installation-products/components/InstallationSearch";

async function fetchInstallationProducts(params: Record<string, string | string[] | undefined>) {
  const supabase = await supabaseServer();

  const productTypeValue = Array.isArray(params.type) ? params.type[0] : params.type;
  const colourValue = Array.isArray(params.colour) ? params.colour[0] : params.colour;
  const sortValue = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const searchValue = Array.isArray(params.q) ? params.q[0] : params.q;

  const productType = productTypeValue ?? null;
  const colour = colourValue ?? null;
  const sort = sortValue || "newest";
  const searchTerm = searchValue?.trim();

  let query = supabase
    .from("installation_products")
    .select(
      `
        *,
        installation_product_images (
          id,
          url,
          sort_order
        )
      `
    )
    .ilike("status", "active");

  if (productType) query = query.eq("product_type", productType);
  if (colour) query = query.eq("colour", colour);
  if (searchTerm) query = query.ilike("name", `%${searchTerm}%`);

  if (sort === "low") {
    query = query.order("price", { ascending: true });
  } else if (sort === "high") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load installation products:", error);
    return [];
  }

  return data ?? [];
}

export default async function InstallationProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const products = await fetchInstallationProducts(params);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      {/* Breadcrumb banner */}
      <div className="border-b border-[#E8E5E0] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-4">
          <nav className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase">
            <Link href="/" className="text-[#9A7A5E] hover:text-[#7A5E44] transition-colors">
              Home
            </Link>
            <span className="text-[#D4CFC8]">/</span>
            <span className="text-[#1A1A1A]">Installation Products</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-10">

        {/* Top bar — heading + controls */}
        <div className="flex flex-wrap justify-between items-end gap-6 pb-7 border-b border-[#E8E5E0]">

          {/* Left — heading + count */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mb-1">
              Installation Essentials
            </p>
            <h1 className="text-2xl sm:text-3xl font-light tracking-wider text-[#1A1A1A]">
              Installation Products
            </h1>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mt-1.5">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Right — search + filters */}
          <div className="flex flex-wrap items-end gap-6">
            <Suspense>
              <InstallationSearch />
            </Suspense>
            <Suspense>
              <InstallationFilters />
            </Suspense>
          </div>
        </div>

        {/* Grid or empty state */}
        {products.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#9A7A5E] mb-2">No results</p>
            <p className="text-sm text-[#6B6B6B]">Try adjusting or clearing your filters.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product) => (
              <InstallationProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
