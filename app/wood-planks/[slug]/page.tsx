import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
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
import WoodPlankClient from "./WoodPlankClient";

export const dynamic = "force-dynamic";

// Cached per-request so generateMetadata and the page share one DB query.
const getPlank = cache(async function getPlank(slug: string) {
  const { data } = await supabaseAdmin()
    .from("wood_planks")
    .select("*")
    .eq("slug", decodeURIComponent(slug))
    .eq("is_active", true)
    .maybeSingle();
  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const plank = await getPlank(slug);
  if (!plank) return { title: "Product Not Found" };

  const title = `${plank.title} | Wood Effect Planks`;
  const description = plank.description
    ? truncate(stripHtml(String(plank.description)), 155)
    : `Buy ${plank.title} wood-effect planks from ${SITE_NAME}. Delivered across the UK.`;
  const image = Array.isArray(plank.images) ? plank.images[0] : undefined;
  const canonical = `/wood-planks/${encodeURIComponent(plank.slug || slug)}`;

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

export default async function WoodPlankPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plank = await getPlank(slug);

  if (!plank) {
    notFound();
  }

  const images: string[] = Array.isArray(plank.images)
    ? plank.images.filter(Boolean)
    : [];
  const price = Number(plank.price_per_box) || 0;

  const plankJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: plank.title,
    description:
      stripHtml(String(plank.description ?? "")) ||
      `${plank.title} from ${SITE_NAME}.`,
    sku: plank.id,
    material: "Wood Effect",
    ...(plank.brand ? { brand: { "@type": "Brand", name: plank.brand } } : {}),
    ...(images.length ? { image: images } : {}),
    ...(price > 0
      ? {
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/wood-planks/${encodeURIComponent(plank.slug || slug)}`,
            priceCurrency: "GBP",
            price: price.toFixed(2),
            priceValidUntil: priceValidUntil(),
            itemCondition: "https://schema.org/NewCondition",
            availability: "https://schema.org/InStock",
            shippingDetails: offerShippingDetails(plank.weight_per_box),
            hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
            seller: SELLER,
          },
        }
      : {}),
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Wood Planks", path: "/wood-planks" },
    { name: plank.title },
  ]);

  return (
    <>
      <JsonLd data={plankJsonLd} />
      <JsonLd data={breadcrumbs} />
      <WoodPlankClient plank={plank} />
    </>
  );
}
