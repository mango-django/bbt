import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import ProductPageClient from "./ProductPageClient";

const selectFields = `
      *,
      product_images (
        id,
        url:image_url,
        sort_order
      )
    `;

// Cached per-request so generateMetadata and the page share one DB query.
const getProduct = cache(async function getProduct(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  const slugWithSpaces = decodedSlug.replace(/-/g, " ");
  const admin = supabaseAdmin();

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

  return (
    (await fetchProduct("slug", decodedSlug)) ||
    (await fetchProduct("slug", slugWithSpaces)) ||
    (await fetchProduct("id", decodedSlug))
  );
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  // meta_title (when set) is already a complete title — use `absolute` so the
  // layout's "%s | Bellos Bespoke Tiles" template doesn't double the brand.
  const baseTitle =
    product.meta_title ||
    `${product.title}${product.material ? ` ${product.material}` : ""} Tiles`;
  const title = product.meta_title
    ? baseTitle
    : `${baseTitle} | ${SITE_NAME}`;
  const description =
    product.meta_description ||
    (product.description
      ? String(product.description).slice(0, 155)
      : `Buy ${product.title} from ${SITE_NAME}. Premium bespoke tiles delivered across the UK.`);
  const image =
    product.og_image_url ||
    (Array.isArray(product.product_images) && product.product_images[0]?.url) ||
    undefined;
  const canonical = `/products/${encodeURIComponent(product.slug || slug)}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = supabaseAdmin();

  const product = await getProduct(slug);

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

  const productImages = sortedImages
    .map((img) => img?.url)
    .filter(Boolean) as string[];
  const price = Number(product.price_per_m2) || Number(product.price_per_tile) || 0;

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || `${product.title} from ${SITE_NAME}.`,
    sku: product.display_id || product.id,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.material ? { material: product.material } : {}),
    ...(productImages.length ? { image: productImages } : {}),
    ...(price > 0
      ? {
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/products/${encodeURIComponent(product.slug || slug)}`,
            priceCurrency: "GBP",
            price: price.toFixed(2),
            availability:
              (product.boxes_in_stock ?? 1) > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: SITE_NAME },
          },
        }
      : {}),
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <ProductPageClient
        product={product}
        sortedImages={sortedImages}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
