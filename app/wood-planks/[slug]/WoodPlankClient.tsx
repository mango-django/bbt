"use client";

import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import ProductGallery from "@/components/ProductGallery";
import WoodPlankCalculator from "@/components/WoodPlankCalculator";

function SpecRow({ label, value }: { label: string; value?: any }) {
  const display =
    value === null ||
    value === undefined ||
    value === "" ||
    value === "—" ||
    String(value).trim() === ""
      ? null
      : String(value);

  if (!display) return null;

  return (
    <div className="grid grid-cols-5 gap-4 py-3 border-b border-[#E8E5E0] last:border-0">
      <p className="col-span-2 text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">
        {label}
      </p>
      <p className="col-span-3 text-sm text-[#1A1A1A] font-light">{display}</p>
    </div>
  );
}

export default function WoodPlankClient({ plank }: { plank: any }) {
  const { addItem } = useCart();

  const images = Array.isArray(plank.images)
    ? plank.images.map((url: string) => ({ url }))
    : [];

  function handleAddToBasket(boxes: number, areaWithWaste: number) {
    addItem({
      product_id: plank.id,
      title: plank.title,
      image: images[0]?.url ?? "",
      productType: "wood_plank",
      price_per_box: plank.price_per_box,
      boxes,
      coverage: plank.coverage_per_box,
      m2: areaWithWaste,
      boxWeight: Number(plank.weight_per_box) || 0,
      quantity: 1,
    });
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      {/* Breadcrumb */}
      <div className="border-b border-[#E8E5E0] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-4">
          <nav className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase">
            <Link href="/wood-planks" className="text-[#9A7A5E] hover:text-[#7A5E44] transition-colors">
              Wood Planks
            </Link>
            <span className="text-[#D4CFC8]">/</span>
            <span className="text-[#1A1A1A]">{plank.title}</span>
          </nav>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

          {/* LEFT — sticky gallery */}
          <div className="lg:sticky lg:top-6 self-start">
            <ProductGallery images={images} title={plank.title} />
          </div>

          {/* RIGHT — product info */}
          <div>

            {/* Category label + title */}
            <div className="mb-6">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mb-2">
                Wood Plank Flooring
              </p>
              <h1 className="text-3xl sm:text-4xl font-light tracking-wider text-[#1A1A1A] leading-tight">
                {plank.title}
              </h1>
            </div>

            {/* Price */}
            {plank.price_per_box && (
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-2xl font-light text-[#1A1A1A]">
                  £{plank.price_per_box}
                </span>
                <span className="text-xs tracking-widest uppercase text-[#9A7A5E]">/ pack</span>
              </div>
            )}

            {/* Description */}
            {plank.description && (
              <p className="text-sm text-[#6B6B6B] leading-relaxed mb-8">
                {plank.description}
              </p>
            )}

            {/* Calculator */}
            <div className="mb-10">
              <WoodPlankCalculator
                coveragePerBox={plank.coverage_per_box}
                pricePerBox={plank.price_per_box}
                onChange={({ boxes, areaWithWaste }) =>
                  handleAddToBasket(boxes, areaWithWaste)
                }
              />
            </div>

            {/* Specifications */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">
                  Specifications
                </p>
                <div className="flex-1 h-px bg-[#E8E5E0]" />
              </div>

              <div className="border border-[#E8E5E0] bg-white px-5 py-1">
                <SpecRow
                  label="Coverage per Pack"
                  value={plank.coverage_per_box ? `${plank.coverage_per_box} m²` : null}
                />
                <SpecRow
                  label="Plank Length"
                  value={plank.plank_length_mm ? `${plank.plank_length_mm} mm` : null}
                />
                <SpecRow
                  label="Plank Width"
                  value={plank.plank_width_mm ? `${plank.plank_width_mm} mm` : null}
                />
                <SpecRow
                  label="Thickness"
                  value={plank.thickness_mm ? `${plank.thickness_mm} mm` : null}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
