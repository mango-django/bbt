import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { PACKAGE_OFFERS } from "@/lib/offers";
import PackageOfferCard from "./PackageOfferCard";

export const metadata: Metadata = {
  title: "Special Offers & Package Deals",
  description:
    "Regularly updated tile package deals — complete kits with tiles, adhesive and grout at one discounted price, delivered across the UK by Bellos Bespoke Tiles.",
  alternates: { canonical: "/offers" },
};

export const revalidate = 0;

async function fetchTileImages(): Promise<Record<string, string>> {
  const supabase = await supabaseServer();

  const productIds = PACKAGE_OFFERS.flatMap((offer) =>
    offer.colourOptions.map((option) => option.productId)
  );

  const { data } = await supabase
    .from("product_images")
    .select("product_id, image_url, sort_order")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });

  const imageByProduct: Record<string, string> = {};
  for (const row of data ?? []) {
    if (!imageByProduct[row.product_id] && row.image_url) {
      imageByProduct[row.product_id] = row.image_url;
    }
  }
  return imageByProduct;
}

export default async function OffersPage() {
  const tileImages = await fetchTileImages();

  return (
    <main className="bg-[#FAFAF8] min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[#E8E5E0] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-4">
          <nav className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase">
            <Link
              href="/"
              className="text-[#9A7A5E] hover:text-[#7A5E44] transition-colors"
            >
              Home
            </Link>
            <span className="text-[#D4CFC8]">/</span>
            <span className="text-[#1A1A1A]">Offers</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#9A7A5E] mb-4">
            Limited Time
          </p>
          <h1 className="text-3xl sm:text-5xl font-thin tracking-widest uppercase text-[#1A1A1A] mb-4">
            Special Offers
          </h1>
          <div className="w-12 h-px bg-[#9A7A5E] mx-auto mb-5" />
          <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto leading-relaxed">
            Complete tiling packages — tiles, adhesive and grout together at one
            discounted price. Regularly updated, so check back for new deals.
          </p>
        </div>

        {/* Package grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {PACKAGE_OFFERS.map((offer) => (
            <PackageOfferCard
              key={offer.id}
              offer={offer}
              tileImages={tileImages}
            />
          ))}
        </div>

        {/* Notes */}
        <div className="mt-12 border-t border-[#E8E5E0] pt-8 max-w-2xl mx-auto text-center">
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            All package prices include VAT. Delivery is calculated at checkout
            based on order weight. Next day delivery applies to orders placed
            before 11:30am, Monday to Friday, subject to stock and courier
            coverage.
          </p>
        </div>
      </div>
    </main>
  );
}
