// lib/shipping.ts

// Prices are ex-VAT: carriers charge Bellos VAT on delivery, so VAT at
// VAT_RATE is added on top wherever delivery is charged or quoted inc-VAT.
export const SHIPPING_RATES = [
  { min: 0, max: 2, price: 11.0 },
  { min: 2.01, max: 5, price: 14.99 },
  { min: 5.01, max: 10, price: 19.99 },
  { min: 10.01, max: 20, price: 24.99 },
  { min: 20.01, max: 49, price: 36.99 },
  { min: 49.01, max: 100, price: 72.99 },
  { min: 100.01, max: 99999, price: 105.99 },
];

export const VAT_RATE = 0.2;

// Ex-VAT delivery rate → the amount the customer actually pays.
export function deliveryIncVat(netRate: number): number {
  return Math.round(netRate * (1 + VAT_RATE) * 100) / 100;
}

// Charged when an order's weight cannot be determined (missing product weight
// data). Tiles are heavy pallet goods, so an unknown weight must never fall
// into the lightest parcel bracket. Ex-VAT, matching the 20-49 kg bracket.
export const UNKNOWN_WEIGHT_DELIVERY = 36.99;

export function findShippingRate(weight: number): number | null {
  if (!Number.isFinite(weight) || weight <= 0) return UNKNOWN_WEIGHT_DELIVERY;

  // Brackets are ordered by max; take the first one the weight fits under so
  // fractional weights between brackets can never fall through.
  for (const rate of SHIPPING_RATES) {
    if (weight <= rate.max) {
      return rate.price;
    }
  }

  return SHIPPING_RATES[SHIPPING_RATES.length - 1]?.price ?? null;
}

export function isValidUKPostcode(postcode: string): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(postcode.trim());
}
