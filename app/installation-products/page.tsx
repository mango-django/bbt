import { supabaseServer } from "@/lib/supabase/server";
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
    <div className="bg-white text-[#1f1f1f]">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-col gap-4 border-b pb-6">
        <div>
          <p className="text-sm uppercase tracking-widest text-gray-500">Installation Essentials</p>
          <h1 className="text-3xl font-bold text-[#1f1f1f]">Installation Products</h1>
          <p className="text-gray-600 mt-2 max-w-3xl">
            Adhesives, grouts, sealers, trims, and tools curated to support your installations.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <InstallationSearch />
          <InstallationFilters />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-500">
          No installation products found for these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <InstallationProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
