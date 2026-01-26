import { supabaseAdmin } from "@/lib/supabase/admin";
import FiltersSidebar from "./FiltersSidebar";
import CategoryTopBar from "./CategoryTopBar";
import ProductCard from "./ProductCard";

export default async function CategoryPage({ params, searchParams }: any) {
  const admin = supabaseAdmin();

  const { slug } = await params;
  const search = await searchParams;

  /* -------------------------------------------
      FETCH CATEGORY
  --------------------------------------------*/
  const { data: category } = await admin
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

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
  const colors: string[] = search.color.split(",");
  query = query.or(colors.map((c: string) => `color.cs.{${c}}`).join(","));
}

if (search.finish) {
  query = query.eq("finish", search.finish);
}

if (search.application) {
  const apps: string[] = search.application.split(",");
  query = query.or(apps.map((a: string) => `application.cs.{${a}}`).join(","));
}

if (search.suitable_room) {
  const rooms: string[] = search.suitable_room.split(",");
  query = query.or(rooms.map((r: string) => `suitable_room.cs.{${r}}`).join(","));
}


  if (search.indoor_outdoor) {
    query = query.eq("indoor_outdoor", search.indoor_outdoor);
  }

  if (search.size) query = query.eq("dimension_string", search.size);

  /* PRICE RANGE */
  const minPrice = Number(search.minPrice ?? 0);
  const maxPrice = Number(search.maxPrice ?? 99999);

  query = query
    .gte("price_per_m2", minPrice)
    .lte("price_per_m2", maxPrice);

  /* SORTING */
  const sort = search.sort ?? "default";

  if (sort === "price_asc")
    query = query.order("price_per_m2", { ascending: true });

  if (sort === "price_desc")
    query = query.order("price_per_m2", { ascending: false });

  if (sort === "newest")
    query = query.order("created_at", { ascending: false });

  query = query.order("sort_order", {
    foreignTable: "product_images",
    ascending: true,
  });

  /* GRID VIEW */
  const gridParam = search.grid ?? "3";
  const gridCols = gridParam === "2" ? "lg:grid-cols-2" : gridParam === "4" ? "lg:grid-cols-4" : "lg:grid-cols-3";

  /* SHOW PER PAGE */
  const showOptions = new Set([12, 24, 36, 48]);
  const showCount = Number(search.show ?? 12);
  const safeShow = showOptions.has(showCount) ? showCount : 12;
  query = query.limit(safeShow);

  /* FETCH PRODUCTS */
  const { data: products } = await query;

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-10">
      <aside className="hidden lg:block">
        <FiltersSidebar categorySlug={slug} />
      </aside>

      <main className="lg:col-span-3 bg-white text-[#2d2d2d] p-6 shadow-sm">
        <CategoryTopBar
          count={products?.length ?? 0}
          heading={category?.name || slug.replace(/-/g, " ")}
        />

        {products && products.length > 0 ? (
          <div className={`mt-8 grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-8`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-gray-500">No products found.</p>
        )}
      </main>
    </div>
  );
}
