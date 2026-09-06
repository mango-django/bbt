// lib/offers.ts
//
// Package-offer definitions for the /offers page. These are curated bundles —
// a fixed number of tile boxes plus the matching adhesive and grout — sold at
// a single fixed price. Prices below are the advertised customer price
// INCLUDING VAT; the cart stores the ex-VAT figure (see packageExVatPrice) so
// checkout's standard "+20% VAT" step lands exactly on the advertised price.
//
// To change the offers, edit this file only: product ids/slugs reference live
// rows in `products` (tiles) and `installation_products` (adhesive/grout), and
// the /offers page pulls each tile's image fresh from `product_images`.

export type OfferColourOption = {
  label: string; // shown on the colour selector
  productId: string; // products.id — used for the tile image
  slug: string; // products.slug — links to the tile's product page
};

export type OfferComponent = {
  qty: number;
  label: string; // customer-facing line, e.g. "7 × 20kg Flexible White Adhesive"
  installationProductId: string; // installation_products.id
};

export type PackageOffer = {
  id: string; // stable id, also used as the cart item's product_id
  name: string; // "Package Offer 1"
  title: string; // headline range/size
  tileLine: string; // boxes/tiles/coverage summary
  colourOptions: OfferColourOption[];
  components: OfferComponent[];
  priceIncVat: number; // advertised package price, inc VAT
  savingIncVat?: number; // advertised total saving, inc VAT (only if supplied)
  nextDayDelivery: boolean; // "Next day delivery if ordered before 11:30am"
  totalWeightKg: number; // whole package weight — drives the delivery bracket
};

// Checkout adds 20% VAT to every cart line, so bundles are carried ex-VAT.
export function packageExVatPrice(offer: PackageOffer): number {
  return Math.round((offer.priceIncVat / 1.2) * 100) / 100;
}

export const PACKAGE_OFFERS: PackageOffer[] = [
  {
    id: "package-offer-1",
    name: "Package Offer 1",
    title: "Qubus Range 30×60",
    tileLine: "16 boxes (144 tiles = 26.18 m²)",
    colourOptions: [
      {
        label: "Light Grey",
        productId: "57ff31bb-9161-449d-95d8-4f113ce62060",
        slug: "qubus-park-light-grey-matt-300x600",
      },
      {
        label: "Mid Grey",
        productId: "a73a047e-fe91-4cdc-ba8c-d2e8c27a15b4",
        slug: "qubus-park-mid-grey-matt-300x600",
      },
      {
        label: "White",
        productId: "96ac427c-dc55-4e2d-918d-d97fecc1a444",
        slug: "qubus-park-white-matt-300x600",
      },
    ],
    components: [
      {
        qty: 7,
        label: "7 × 20kg Flexible White Adhesive",
        installationProductId: "d1190273-a7fa-4361-905d-cbe96db6ea6f", // Instarmac Ultra ProFlex SPES White 20kg
      },
      {
        qty: 1,
        label: "1 × 10kg White Flex Grout",
        installationProductId: "efca3527-5f37-4eaa-b59b-ad61aa417875", // Instarmac UltraPro Grout Flexible White 10kg
      },
    ],
    priceIncVat: 895,
    nextDayDelivery: true,
    // 16 boxes × 32.4kg + 7 × 20kg adhesive + 1 × 10kg grout
    totalWeightKg: 668.4,
  },
  {
    id: "package-offer-2",
    name: "Package Offer 2",
    title: "Qubus Matt 60×60",
    tileLine: "14 boxes (70 tiles = 25.15 m²)",
    colourOptions: [
      {
        label: "Mid Grey",
        productId: "e9121aad-b42a-4da8-bc4b-f80e5909fc35",
        slug: "qubus-mid-grey-matt-600x600",
      },
      {
        label: "White",
        productId: "6ddd9dd1-8e66-45aa-8355-0532ef548d2b",
        slug: "qubus-park-white-matt-600x600",
      },
    ],
    components: [
      {
        qty: 8,
        label: "8 × 20kg Flex Grey Adhesive",
        installationProductId: "5696c723-624a-4356-a5f4-51f69da0405b", // Instarmac Ultra ProFlex SPES Grey 20kg
      },
      {
        qty: 1,
        label: "1 × 10kg Grey Flex Grout",
        installationProductId: "1cb6d76b-d82c-4f17-adf3-6cb6cc140ee1", // Instarmac UltraPro Grout Flexible Grey 10kg
      },
    ],
    priceIncVat: 920,
    nextDayDelivery: false,
    // ~503kg tiles (25.15 m² at ~20kg/m², no box weight on record)
    // + 8 × 20kg adhesive + 1 × 10kg grout
    totalWeightKg: 673,
  },
  {
    id: "package-offer-3",
    name: "Package Offer 3",
    title: "Bosco Range 60×60",
    tileLine: "18 boxes = 25.65 m²",
    colourOptions: [
      {
        label: "Grey",
        productId: "4400aa4c-1e1d-4327-a3ae-87919a6a22b7",
        slug: "bosco-grey-matt-597x597",
      },
      {
        label: "Anthracite",
        productId: "a0796596-78bb-4154-9841-4f574146ad43",
        slug: "bosco-anthracite-matt-597x597",
      },
      {
        label: "Cream",
        productId: "5af9c812-fb52-47bc-a05a-935796b576f8",
        slug: "bosco-cream-matt-597x597",
      },
      {
        label: "Mink",
        productId: "a228ef48-c0bf-48ac-b7e3-7d0a47d73f2a",
        slug: "bosco-mink-matt-597x597",
      },
    ],
    components: [
      {
        qty: 8,
        label: "8 × 20kg Flexible Grey Adhesive",
        installationProductId: "5696c723-624a-4356-a5f4-51f69da0405b",
      },
      {
        qty: 1,
        label: "1 × 10kg Flex Grey Grout",
        installationProductId: "1cb6d76b-d82c-4f17-adf3-6cb6cc140ee1",
      },
    ],
    priceIncVat: 849,
    savingIncVat: 218,
    nextDayDelivery: true,
    // 18 boxes × 26.68kg + 8 × 20kg adhesive + 1 × 10kg grout
    totalWeightKg: 650.2,
  },
  {
    id: "package-offer-4",
    name: "Package Offer 4",
    title: "Bosco 30×60",
    tileLine: "24 boxes = 25.51 m²",
    colourOptions: [
      {
        label: "Grey",
        productId: "aac775d1-5fe2-4b70-83ef-ef8e1ebaab5b",
        slug: "bosco-grey-matt-297x597",
      },
      {
        label: "Anthracite",
        productId: "3bddcfca-e754-45da-a614-c2f116958f9a",
        slug: "bosco-anthracite-matt-297x597",
      },
      {
        label: "Cream",
        productId: "72042374-6682-443a-9585-9fd1c2223daa",
        slug: "bosco-cream-matt-297x597",
      },
      {
        label: "Mink",
        productId: "bcb0e45a-4691-45af-8966-ad97c252f1ef",
        slug: "bosco-mink-matt-297x597",
      },
    ],
    components: [
      {
        qty: 7,
        label: "7 × 20kg Flex White Adhesive",
        installationProductId: "d1190273-a7fa-4361-905d-cbe96db6ea6f",
      },
      {
        qty: 1,
        label: "1 × 10kg White Flex Grout",
        installationProductId: "efca3527-5f37-4eaa-b59b-ad61aa417875",
      },
    ],
    priceIncVat: 849,
    savingIncVat: 213,
    nextDayDelivery: true,
    // 24 boxes × 19.74kg + 7 × 20kg adhesive + 1 × 10kg grout
    totalWeightKg: 623.8,
  },
];
