// lib/shipping-server.ts
//
// Server-side delivery calculation. The browser's cart payload carries the
// box weight that was on the product page when the item was added — which can
// be stale (old localStorage carts) or zero (products imported without weight
// data). Checkout must never trust it: look the weights up fresh and charge
// from the rate table.

import type { SupabaseClient } from "@supabase/supabase-js";
import { findShippingRate } from "@/lib/shipping";

type ShippableItem = {
  product_id?: string;
  productType?: string;
  m2?: number;
  coverage?: number;
  boxes?: number;
  quantity?: number;
  boxWeight?: number;
};

export type CartShipping = {
  weight: number;
  cost: number;
};

export async function resolveCartShipping(
  supabase: SupabaseClient,
  cart: ShippableItem[]
): Promise<CartShipping> {
  const tileIds = cart
    .filter((item) => item.productType === "tile" && item.product_id)
    .map((item) => item.product_id as string);

  const dbProducts = new Map<
    string,
    { box_weight_kg: number | null; box_coverage_m2: number | null }
  >();

  if (tileIds.length > 0) {
    const { data } = await supabase
      .from("products")
      .select("id, box_weight_kg, box_coverage_m2")
      .in("id", tileIds);

    for (const row of data ?? []) {
      dbProducts.set(row.id, row);
    }
  }

  const weight = cart.reduce((sum, item) => {
    // Bundles carry the whole package weight in boxWeight (fixed contents, so
    // there is no per-product DB row to look up).
    if (item.productType === "installation" || item.productType === "bundle") {
      return sum + (Number(item.boxWeight) || 0) * (Number(item.quantity) || 1);
    }

    if (item.productType === "wood_plank") {
      return sum + (Number(item.boxes) || 0) * (Number(item.boxWeight) || 0);
    }

    const db = item.product_id ? dbProducts.get(item.product_id) : undefined;
    const boxWeight = Number(db?.box_weight_kg) || Number(item.boxWeight) || 0;
    const coverage =
      Number(db?.box_coverage_m2) || Number(item.coverage) || 1;
    const boxes = Math.ceil((Number(item.m2) || 0) / coverage);
    return sum + boxes * boxWeight;
  }, 0);

  return {
    weight,
    cost: findShippingRate(weight) ?? 0,
  };
}
