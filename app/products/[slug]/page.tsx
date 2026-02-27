import Link from "next/link";
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
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#9A7A5E] mb-3">Not Found</p>
          <p className="text-sm text-[#6B6B6B] mb-6">This product could not be found.</p>
          <Link
            href="/tiles"
            className="text-[10px] tracking-[0.25em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:text-[#9A7A5E] hover:border-[#9A7A5E] transition-colors"
          >
            Browse All Tiles
          </Link>
        </div>
      </div>
    );
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
