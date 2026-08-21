// lib/pricing.ts
//
// Tiles leave the warehouse in whole boxes, so the chargeable quantity is
// the customer's area rounded UP to full boxes — the same rounding the
// product-page calculator shows. Products without box data (box_coverage_m2
// null) are charged on the exact m² instead, matching the calculator's
// dimension-based fallback.
//
// Shared by the cart context, cart/checkout pages and both checkout API
// routes so the displayed price, the stored order and the Stripe charge
// always agree to the penny.

export type TilePricingFields = {
  price_per_m2?: unknown;
  price_per_box?: unknown;
  m2?: unknown;
  coverage?: unknown; // m² per box
};

export function tileBoxes(m2?: unknown, coverage?: unknown): number {
  const area = Number(m2) || 0;
  const cov = Number(coverage) || 0;
  if (area <= 0 || cov <= 0) return 0;
  // Epsilon guards float artefacts (e.g. 2.88 / 1.44 → 2.0000000000000004)
  return Math.ceil(area / cov - 1e-9);
}

export function tileLinePrice(item: TilePricingFields): number {
  const boxes = tileBoxes(item.m2, item.coverage);
  const ratePerM2 = Number(item.price_per_m2) || 0;

  if (boxes > 0) {
    const boxPrice =
      Number(item.price_per_box) ||
      Math.round(ratePerM2 * (Number(item.coverage) || 0) * 100) / 100;
    return Math.round(boxPrice * boxes * 100) / 100;
  }

  // No box data — exact-m² pricing
  return Math.round(ratePerM2 * (Number(item.m2) || 0) * 100) / 100;
}
