// lib/shipping.ts

export const SHIPPING_RATES = [
  { min: 0, max: 2, price: 6.99 },
  { min: 2.01, max: 5, price: 8.99 },
  { min: 5.01, max: 10, price: 14.99 },
  { min: 10.01, max: 20, price: 19.99 },
  { min: 21, max: 49, price: 30 },
  { min: 50, max: 100, price: 60 },
  { min: 100.01, max: 99999, price: 90 },
];

export function findShippingRate(weight: number): number | null {
  if (weight <= 0) return SHIPPING_RATES[0]?.price ?? null;

  for (const rate of SHIPPING_RATES) {
    if (weight >= rate.min && weight <= rate.max) {
      return rate.price;
    }
  }

  // If we somehow miss every bracket (shouldn't happen), fall back to the
  // highest defined price so the UI never shows a non-response.
  return SHIPPING_RATES[SHIPPING_RATES.length - 1]?.price ?? null;
}

export function isValidUKPostcode(postcode: string): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(postcode.trim());
}
