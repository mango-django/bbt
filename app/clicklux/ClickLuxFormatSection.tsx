"use client";

import { useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";

type Plank = {
  id: string;
  title: string;
  slug: string | null;
  images: string[] | null;
  price_per_box: number | null;
  coverage_per_box: number | null;
  plank_length_mm: number | null;
  plank_width_mm: number | null;
  thickness_mm: number | null;
};

// Colour name = product title without the range prefix.
function colourName(title: string): string {
  return title.replace(/^ClickLux\s+(Premium\s+)?/i, "");
}

export default function ClickLuxFormatSection({
  formatLabel,
  planks,
}: {
  formatLabel: string;
  planks: Plank[];
}) {
  const [selected, setSelected] = useState(0);

  const current = planks[selected];
  if (!current) return null;

  const images = Array.isArray(current.images) ? current.images : [];
  const mainImage = images[0] ?? null;
  const slug = current.slug?.trim() || current.id;
  const href = `/wood-planks/${encodeURIComponent(slug)}`;

  const sizeLine = [
    current.plank_length_mm && current.plank_width_mm
      ? `${current.plank_length_mm} × ${current.plank_width_mm}mm`
      : null,
    current.thickness_mm ? `${current.thickness_mm}mm thick` : null,
    current.coverage_per_box ? `${current.coverage_per_box} m² per pack` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const perM2 =
    current.price_per_box && current.coverage_per_box
      ? current.price_per_box / current.coverage_per_box
      : null;

  return (
    <section className="border border-[#E8E5E0] bg-white overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Image — swaps with the selected colour */}
        <Link
          href={href}
          className="group relative block bg-[#EEECE9] min-h-[280px] sm:min-h-[380px]"
        >
          <ProductImage
            src={mainImage}
            alt={current.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute top-5 left-5 bg-[#9A7A5E] text-white text-[11px] tracking-[0.3em] uppercase px-4 py-2">
            {formatLabel}
          </div>
        </Link>

        {/* Details + colour selector */}
        <div className="flex flex-col px-7 py-8 sm:px-10 sm:py-10">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#9A7A5E] mb-2">
            ClickLux {formatLabel}
          </p>
          <h2 className="text-2xl sm:text-3xl font-light tracking-wider text-[#1A1A1A] leading-tight">
            {colourName(current.title)}
          </h2>
          <p className="text-xs text-[#6B6B6B] tracking-wide mt-2">{sizeLine}</p>

          {/* Colour selector */}
          <div className="mt-7">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mb-3">
              Colour — {planks.length} option{planks.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {planks.map((plank, i) => {
                const thumb = Array.isArray(plank.images) ? plank.images[0] : null;
                const isSelected = i === selected;
                return (
                  <button
                    key={plank.id}
                    onClick={() => setSelected(i)}
                    title={colourName(plank.title)}
                    aria-label={colourName(plank.title)}
                    aria-pressed={isSelected}
                    className={`relative w-14 h-14 overflow-hidden bg-[#EEECE9] transition-all duration-200 ${
                      isSelected
                        ? "ring-2 ring-[#9A7A5E] ring-offset-2 ring-offset-white"
                        : "ring-1 ring-[#E8E5E0] hover:ring-[#9A7A5E]/60"
                    }`}
                  >
                    <ProductImage
                      src={thumb}
                      alt={colourName(plank.title)}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-2.5">
              {colourName(current.title)}
            </p>
          </div>

          {/* Price + CTA */}
          <div className="mt-auto pt-8">
            <div className="flex items-baseline gap-3 mb-1">
              {perM2 !== null && (
                <span className="text-2xl sm:text-3xl font-light tracking-wide text-[#1A1A1A]">
                  £{perM2.toFixed(2)}
                </span>
              )}
              <span className="text-sm text-[#6B6B6B] tracking-wide">per m²</span>
              {current.price_per_box && (
                <span className="text-sm text-[#9A7A5E] tracking-wide">
                  · £{current.price_per_box.toFixed(2)} per pack
                </span>
              )}
            </div>
            <Link
              href={href}
              className="mt-4 inline-block px-8 py-3.5 bg-[#1A1A1A] text-white text-[10px] tracking-[0.3em] uppercase hover:bg-[#9A7A5E] transition-colors duration-200"
            >
              View {colourName(current.title)}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
