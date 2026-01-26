import { supabaseAdmin } from "@/lib/supabase/admin";
import ProductPageClient from "./ProductPageClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const slugWithSpaces = decodedSlug.replace(/-/g, " ");
  const admin = supabaseAdmin();

  const selectFields = `
      *,
      product_images (
        id,
        url:image_url,
        sort_order
      )
    `;

  const fetchProduct = async (column: string, value: string) => {
    if (!value) return null;
    const { data } = await admin
      .from("products")
      .select(selectFields)
      .eq("status", "active")
      .eq(column, value)
      .order("sort_order", { foreignTable: "product_images", ascending: true })
      .maybeSingle();
    return data;
  };

  let product =
    (await fetchProduct("slug", decodedSlug)) ||
    (await fetchProduct("slug", slugWithSpaces)) ||
    (await fetchProduct("id", decodedSlug));

  if (!product) {
    return <div className="p-10">Product not found</div>;
  }

  const sortedImages = Array.isArray(product.product_images)
    ? [...product.product_images].sort(
        (a, b) => (a?.sort_order ?? 999) - (b?.sort_order ?? 999)
      )
    : [];

  return (
    <ProductPageClient product={product} sortedImages={sortedImages} />
  );
}
