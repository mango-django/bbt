// lib/seo.ts
// Shared SEO builders used by page JSON-LD and the Google Shopping feed.
// Keeping availability / shipping / returns logic in one place guarantees the
// structured data on product pages always agrees with the Merchant Center
// feed — mismatches there are the #1 cause of Shopping disapprovals.

import { SITE_URL, SITE_NAME } from "@/lib/site";
import { findShippingRate, deliveryIncVat } from "@/lib/shipping";

/* ------------------------------------------------------------------ */
/* Availability                                                        */
/* ------------------------------------------------------------------ */

// null/undefined stock means "not tracked" — these products are purchasable
// (supplier-fulfilled, 3-5 day lead time), so they count as in stock.
export function isInStock(boxesInStock: number | null | undefined): boolean {
  return boxesInStock == null || Number(boxesInStock) > 0;
}

export function schemaAvailability(boxesInStock: number | null | undefined): string {
  return isInStock(boxesInStock)
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
}

export function feedAvailability(boxesInStock: number | null | undefined): string {
  return isInStock(boxesInStock) ? "in_stock" : "out_of_stock";
}

/* ------------------------------------------------------------------ */
/* Shipping & returns (facts from /delivery-returns)                   */
/* ------------------------------------------------------------------ */

// Dispatch is 2-5 working days; courier transit is 1-3 working days.
const HANDLING_DAYS = { min: 2, max: 5 };
const TRANSIT_DAYS = { min: 1, max: 3 };

// Returns the VAT-inclusive delivery price — Google requires the rate the
// customer actually pays, and SHIPPING_RATES are ex-VAT.
export function shippingRateForWeight(weightKg: number | null | undefined): number | null {
  const w = Number(weightKg);
  if (!Number.isFinite(w) || w <= 0) return null;
  const rate = findShippingRate(w);
  return rate == null ? null : deliveryIncVat(rate);
}

// schema.org OfferShippingDetails for one unit (one box) delivered in GB.
export function offerShippingDetails(weightKg: number | null | undefined) {
  const rate = shippingRateForWeight(weightKg);
  return {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: rate ?? deliveryIncVat(11.0),
      currency: "GBP",
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "GB",
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: HANDLING_DAYS.min,
        maxValue: HANDLING_DAYS.max,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: TRANSIT_DAYS.min,
        maxValue: TRANSIT_DAYS.max,
        unitCode: "DAY",
      },
    },
  };
}

// 14-day cancellation window, customer pays return postage, full refund
// within 14 days of receipt (see /delivery-returns).
export const MERCHANT_RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "GB",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
  refundType: "https://schema.org/FullRefund",
  merchantReturnLink: `${SITE_URL}/delivery-returns`,
};

// Google treats a missing priceValidUntil as a warning on merchant listings.
// Pages are rendered per-request, so a rolling +30 days is always fresh.
export function priceValidUntil(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}

export const SELLER = { "@type": "Organization", name: SITE_NAME, url: SITE_URL };

/* ------------------------------------------------------------------ */
/* Breadcrumbs                                                         */
/* ------------------------------------------------------------------ */

export function breadcrumbJsonLd(items: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: `${SITE_URL}${item.path}` } : {}),
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Text utilities (shared by metadata + feed)                          */
/* ------------------------------------------------------------------ */

export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(input: string, max: number): string {
  if (input.length <= max) return input;
  const cut = input.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20))}…`;
}
