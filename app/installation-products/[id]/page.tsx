import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbJsonLd,
  MERCHANT_RETURN_POLICY,
  offerShippingDetails,
  priceValidUntil,
  SELLER,
  stripHtml,
  truncate,
} from "@/lib/seo";
import InstallationProductPageClient from "@/app/installation-products/[slug]/InstallationProductPageClient";

// Cached per-request so generateMetadata and the page share one DB query.
const getInstallationProduct = cache(async function getInstallationProduct(
  id: string
) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("installation_products")
    .select("*, installation_product_images(*)")
    .eq("id", id)
    .single();
  if (error) {
    console.error("INSTALLATION PRODUCT LOAD ERROR:", error);
    return null;
  }
  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getInstallationProduct(id);
  if (!product) return { title: "Product Not Found" };

  const title = product.product_type
    ? `${product.name} | ${product.product_type}`
    : product.name;
  const description = product.description
    ? truncate(stripHtml(String(product.description)), 155)
    : `Buy ${product.name} from ${SITE_NAME}. Tile installation products delivered across the UK.`;
  const image = Array.isArray(product.installation_product_images)
    ? product.installation_product_images[0]?.url
    : undefined;
  const canonical = `/installation-products/${encodeURIComponent(id)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}${canonical}`,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function InstallationProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getInstallationProduct(id);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#9A7A5E] mb-3">Not Found</p>
          <p className="text-sm text-[#6B6B6B] mb-6">This product could not be found.</p>
          <Link
            href="/installation-products"
            className="text-[10px] tracking-[0.25em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:text-[#9A7A5E] hover:border-[#9A7A5E] transition-colors"
          >
            Browse Installation Products
          </Link>
        </div>
      </div>
    );
  }

  const images = Array.isArray(data.installation_product_images)
    ? data.installation_product_images
    : [];
  const imageUrls = images
    .map((img: { url?: string }) => img?.url)
    .filter(Boolean) as string[];
  const price =
    Number(data.price ?? data.unit_price ?? data.unit_amount ?? 0) || 0;

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name,
    description:
      stripHtml(String(data.description ?? "")) ||
      `${data.name} from ${SITE_NAME}.`,
    sku: data.id,
    ...(data.brand ? { brand: { "@type": "Brand", name: data.brand } } : {}),
    ...(data.colour ? { color: data.colour } : {}),
    ...(imageUrls.length ? { image: imageUrls } : {}),
    ...(price > 0
      ? {
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/installation-products/${encodeURIComponent(id)}`,
            priceCurrency: "GBP",
            price: price.toFixed(2),
            priceValidUntil: priceValidUntil(),
            itemCondition: "https://schema.org/NewCondition",
            availability: "https://schema.org/InStock",
            shippingDetails: offerShippingDetails(data.weight_each),
            hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
            seller: SELLER,
          },
        }
      : {}),
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Installation Products", path: "/installation-products" },
    { name: data.name },
  ]);

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbs} />
      <InstallationProductPageClient product={data} images={images} />
    </>
  );
}
