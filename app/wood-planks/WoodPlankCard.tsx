"use client";

import Link from "next/link";
import ProductImage from "@/components/ProductImage";

export default function WoodPlankCard({ plank }: { plank: any }) {
  const images = Array.isArray(plank.images) ? plank.images : [];
  const mainImage = images[0] ?? null;
  const slug = plank.slug?.trim() || plank.id;
  const href = slug ? `/wood-planks/${encodeURIComponent(slug)}` : "#";

  return (
    <Link href={href} className="group block">

      {/* Image — 4:5 portrait with hover zoom */}
      <div
        className="relative w-full overflow-hidden bg-[#EEECE9]"
        style={{ aspectRatio: "4 / 5" }}
      >
        <ProductImage
          src={mainImage}
          alt={plank.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      {/* Details */}
      <div className="mt-3 px-0.5">
        {plank.coverage_per_box && (
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] mb-1">
            {plank.coverage_per_box} m² per pack
          </p>
        )}
        <p className="text-sm text-[#1A1A1A] font-light leading-snug tracking-wide">
          {plank.title}
        </p>
        {plank.price_per_box && (
          <p className="mt-1 text-xs text-[#6B6B6B] tracking-wide">
            £{plank.price_per_box} / pack
          </p>
        )}
      </div>

    </Link>
  );
}
