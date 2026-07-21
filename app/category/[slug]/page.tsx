import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import FiltersSidebar from "./FiltersSidebar";
import FiltersDrawer from "./FiltersDrawer";
import CategoryTopBar from "./CategoryTopBar";
import ProductCard from "./ProductCard";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Cached per-request so generateMetadata and the page share one query.
const getCategory = cache(async function getCategory(slug: string) {
  const { data } = await supabaseAdmin()
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data;
});

// Query params that change the product set produce near-duplicate pages —
// canonicalise them to the clean category URL and keep them out of the index.
const FILTER_PARAMS = [
  "material",
  "color",
  "finish",
  "application",
  "suitable_room",
  "indoor_outdoor",
  "size",
  "minPrice",
  "maxPrice",
  "sort",
  "show",
  "grid",
];

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const search = await searchParams;
  const category = await getCategory(slug);

  const name =
    category?.name ??
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const title = `${name} Tiles`;
  const description = `Shop our ${name.toLowerCase()} tile collection — premium porcelain, ceramic and natural stone tiles with UK-wide delivery from ${SITE_NAME}.`;
  const canonical = `/category/${encodeURIComponent(slug)}`;
  const isFiltered = FILTER_PARAMS.some((p) => search[p] != null);

  return {
    title,
    description,
    alternates: { canonical },
    ...(isFiltered ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}${canonical}`,
      ...(category?.image_url ? { images: [{ url: category.image_url }] } : {}),
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const admin = supabaseAdmin();
  const { slug } = await params;
  const rawSearch = await searchParams;
  const search = Object.fromEntries(
    Object.entries(rawSearch).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ])
  ) as Record<string, string | undefined>;

  /* -------------------------------------------
      FETCH CATEGORY
  --------------------------------------------*/
  const category = await getCategory(slug);

  /* -------------------------------------------
      BASE PRODUCT QUERY
  --------------------------------------------*/
  let query = admin
    .from("products")
    .select(`
      *,
      product_images (
        id,
        url:image_url,
        sort_order
      )
    `)
    .eq("status", "active");

  if (category?.id) {
    query = query.contains("category_ids", [category.id]);
  }

  /* -------------------------------------------
      STRUCTURED FILTERS
  --------------------------------------------*/
  if (search.material) query = query.eq("material", search.material);

  if (search.color) {
    const colors = search.color.split(",");
    query = query.or(colors.map((c: string) => `color.cs.{${c}}`).join(","));
  }

  if (search.finish) query = query.eq("finish", search.finish);

  if (search.application) {
    const apps = search.application.split(",");
    query = query.or(apps.map((a: string) => `application.cs.{${a}}`).join(","));
  }

  if (search.suitable_room) {
    const rooms = search.suitable_room.split(",");
    query = query.or(
      rooms.map((r: string) => `suitable_room.cs.{${r}}`).join(",")
    );
  }

  if (search.indoor_outdoor) {
    query = query.eq("indoor_outdoor", search.indoor_outdoor);
  }

  if (search.size) query = query.eq("dimension_string", search.size);

  /* PRICE RANGE */
  const minPrice = Number(search.minPrice ?? 0);
  const maxPrice = Number(search.maxPrice ?? 99999);
  query = query.gte("price_per_m2", minPrice).lte("price_per_m2", maxPrice);

  /* SORTING */
  const sort = search.sort ?? "default";
  if (sort === "price_asc") query = query.order("price_per_m2", { ascending: true });
  if (sort === "price_desc") query = query.order("price_per_m2", { ascending: false });
  if (sort === "newest") query = query.order("created_at", { ascending: false });

  query = query.order("sort_order", {
    foreignTable: "product_images",
    ascending: true,
  });

  /* GRID */
  const gridParam = search.grid ?? "3";
  const gridCols =
    gridParam === "2" ? "lg:grid-cols-2"
    : gridParam === "4" ? "lg:grid-cols-4"
    : "lg:grid-cols-3";

  /* SHOW PER PAGE */
  const showOptions = new Set([12, 24, 36, 48]);
  const showCount = Number(search.show ?? 12);
  query = query.limit(showOptions.has(showCount) ? showCount : 12);

  const { data: products } = await query;
  const heading = category?.name ?? slug.replace(/-/g, " ");

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${heading} Tiles`,
    url: `${SITE_URL}/category/${encodeURIComponent(slug)}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: (products ?? [])
        .filter((p) => p.slug)
        .map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/products/${encodeURIComponent(p.slug)}`,
          name: p.title,
        })),
    },
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "All Tiles", path: "/tiles" },
    { name: heading },
  ]);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={breadcrumbs} />

      {/* ---- Category breadcrumb banner ---- */}
      <div className="border-b border-[#E8E5E0] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-4">
          <nav className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase">
            <Link href="/tiles" className="text-[#9A7A5E] hover:text-[#7A5E44] transition-colors">
              All Tiles
            </Link>
            <span className="text-[#D4CFC8]">/</span>
            <span className="text-[#1A1A1A] capitalize">{heading}</span>
          </nav>
        </div>
      </div>

      {/* ---- Main layout ---- */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-10">

        {/* Mobile drawer */}
        <FiltersDrawer categorySlug={slug} />

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12">

          {/* Desktop sidebar — sticky */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <FiltersSidebar categorySlug={slug} />
            </div>
          </aside>

          {/* Main content */}
          <section>
            <CategoryTopBar
              count={products?.length ?? 0}
              heading={heading}
            />

            {products && products.length > 0 ? (
              <div className={`mt-8 grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-x-6 gap-y-10`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="mt-16 text-center">
                <p className="text-[11px] tracking-[0.3em] uppercase text-[#9A7A5E] mb-2">No results</p>
                <p className="text-sm text-[#6B6B6B]">Try adjusting or clearing your filters.</p>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
