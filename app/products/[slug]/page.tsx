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

  /* --------------------------------------------------
     RELATED PRODUCTS — size variants or same colour
     -------------------------------------------------- */
  let relatedProducts: any[] = [];

  // Strip trailing dimension patterns (e.g. "600x600", "300 x 600") to get base name
  const baseName = product.title
    ?.replace(/\s*\d+\s*[x×]\s*\d+\s*/gi, "")
    .trim();

  // 1) Try size variants: same base name, different product
  if (baseName && baseName.length >= 3) {
    const { data: sizeVariants } = await admin
      .from("products")
      .select(selectFields)
      .eq("status", "active")
      .neq("id", product.id)
      .ilike("title", `${baseName}%`)
      .order("sort_order", { foreignTable: "product_images", ascending: true })
      .limit(4);

    if (sizeVariants && sizeVariants.length > 0) {
      relatedProducts = sizeVariants;
    }
  }

  // 2) Fallback: same colour category
  if (relatedProducts.length === 0) {
    const colors: string[] = Array.isArray(product.color)
      ? product.color
      : product.color
      ? [product.color]
      : [];

    if (colors.length > 0) {
      const { data: colourMatches } = await admin
        .from("products")
        .select(selectFields)
        .eq("status", "active")
        .neq("id", product.id)
        .overlaps("color", colors)
        .order("sort_order", { foreignTable: "product_images", ascending: true })
        .limit(3);

      if (colourMatches) {
        relatedProducts = colourMatches;
      }
    }
  }

  return (
    <ProductPageClient
      product={product}
      sortedImages={sortedImages}
      relatedProducts={relatedProducts}
    />
  );
}
