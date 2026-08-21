"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import ProductGallery from "@/components/ProductGallery";
import ProductCalculator from "@/components/ProductCalculator";
import ProductImage from "@/components/ProductImage";

function Chevron() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
      <path
        d="M1 1L5 5L9 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpecRow({ label, value }: { label: string; value: any }) {
  const display =
    value === null ||
    value === undefined ||
    value === "" ||
    value === "—" ||
    value === "null null" ||
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

export default function ProductPageClient({ product, sortedImages, relatedProducts = [] }: any) {
  const { addItem } = useCart();

  const num = (value: any) => {
    if (value === null || value === undefined) return null;
    const raw = String(value).trim();
    if (!raw || raw.toLowerCase() === "null") return null;
    const parsed = Number(raw.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  };

  /* ----------------------------------------------
     NORMALISED BOX DATA
     ---------------------------------------------- */
  const weightPerBox =
    num(product.weight_per_box) ??
    num(product.box_weight_kg) ??
    0;

  const coveragePerBox =
    Number(product.box_coverage_m2) ||
    Number(product.m2_per_box) ||
    0;

  /* ----------------------------------------------
     DERIVED PRICING (fallback when DB is null)
     ---------------------------------------------- */
  const widthMm = num(product.tile_width_mm);
  const heightMm = num(product.tile_height_mm);
  const pricePerM2 = num(product.price_per_m2);
  const tilesPerBox = num(product.tiles_per_box);

  const areaM2 =
    widthMm !== null && heightMm !== null
      ? (widthMm * heightMm) / 1_000_000
      : null;

  const derivedPricePerTile =
    pricePerM2 !== null && areaM2 && areaM2 > 0
      ? Number((pricePerM2 * areaM2).toFixed(2))
      : null;

  const derivedPricePerBox =
    derivedPricePerTile !== null && tilesPerBox && tilesPerBox > 0
      ? Number((derivedPricePerTile * tilesPerBox).toFixed(2))
      : null;

  const pricePerTile =
    num(product.price_per_tile) ?? derivedPricePerTile;
  const pricePerBox =
    num(product.price_per_box) ?? derivedPricePerBox;

  const productWithDerivedPrices = {
    ...product,
    price_per_tile: pricePerTile ?? product.price_per_tile,
    price_per_box: pricePerBox ?? product.price_per_box,
  };

  /* ----------------------------------------------
     FINISH OPTIONS
     ---------------------------------------------- */
  const finishList = Array.isArray(product.finish)
    ? product.finish
    : product.finish
    ? [product.finish]
    : [];

  const [selectedFinish, setSelectedFinish] = useState(
    finishList.length === 1 ? finishList[0] : ""
  );

  /* ----------------------------------------------
     CALCULATOR OUTPUT
     ---------------------------------------------- */
  const [calculatedM2, setCalculatedM2] = useState(1);
  const [calculatedBoxes, setCalculatedBoxes] = useState(1);
  const [calculatedTiles, setCalculatedTiles] = useState(0);

  /* ----------------------------------------------
     PRODUCT IMAGE
     ---------------------------------------------- */
  const firstImage = sortedImages?.[0]?.url ?? "";

  /* ----------------------------------------------
     ADD TO CART
     ---------------------------------------------- */
  const handleAddToBasket = () => {
    if (finishList.length > 0 && !selectedFinish) {
      alert("Please select a finish before adding to basket.");
      return;
    }

    addItem({
      product_id: product.id,
      title: product.title,
      image: firstImage,
      finish: selectedFinish,
      productType: "tile",
      price_per_m2: Number(product.price_per_m2),
      price_per_box: pricePerBox ?? undefined,
      m2: calculatedM2,
      coverage: coveragePerBox,
      boxWeight: weightPerBox,
      quantity: 1,
    });
  };

  /* ----------------------------------------------
     RENDER VIEW
     ---------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      {/* Breadcrumb */}
      <div className="border-b border-[#E8E5E0] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-4">
          <nav className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase">
            <Link href="/tiles" className="text-[#9A7A5E] hover:text-[#7A5E44] transition-colors">
              All Tiles
            </Link>
            <span className="text-[#D4CFC8]">/</span>
            <span className="text-[#1A1A1A]">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

          {/* LEFT — sticky gallery */}
          <div className="lg:sticky lg:top-6 self-start">
            <ProductGallery images={sortedImages} title={product.title} />
          </div>

          {/* RIGHT — product info */}
          <div>

            {/* Title & size */}
            <div className="mb-6">
              {(widthMm !== null && heightMm !== null) && (
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mb-2">
                  {widthMm} × {heightMm} mm
                </p>
              )}
              <h1 className="text-3xl sm:text-4xl font-light tracking-wider text-[#1A1A1A] leading-tight">
                {product.title}
              </h1>
            </div>

            {/* Price */}
            {product.price_per_m2 && (
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-2xl font-light text-[#1A1A1A]">
                  £{product.price_per_m2}
                </span>
                <span className="text-xs tracking-widest uppercase text-[#9A7A5E]">/ m²</span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-sm text-[#6B6B6B] leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            {/* Finish selector */}
            {finishList.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">
                    Finish
                  </p>
                  <div className="flex-1 h-px bg-[#E8E5E0]" />
                </div>
                {finishList.length === 1 ? (
                  <p className="text-sm text-[#1A1A1A] font-light">{finishList[0]}</p>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedFinish}
                      onChange={(e) => setSelectedFinish(e.target.value)}
                      className="appearance-none w-full border-0 border-b border-[#D4CFC8] pb-2 pt-1 pr-8 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] cursor-pointer transition-colors text-[#1A1A1A]"
                    >
                      <option value="">Select a finish</option>
                      {finishList.map((f: string) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-0 bottom-2.5 text-[#9A7A5E]">
                      <Chevron />
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Calculator */}
            <div className="mb-6">
              <ProductCalculator
                product={productWithDerivedPrices}
                onChange={(calc) => {
                  setCalculatedM2(calc.m2);
                  setCalculatedBoxes(calc.boxes);
                  setCalculatedTiles(calc.tiles);
                }}
              />
            </div>

            {/* Add to Basket */}
            <button
              onClick={handleAddToBasket}
              className="w-full py-4 bg-[#1A1A1A] text-white text-xs tracking-[0.3em] uppercase hover:bg-[#2A2A2A] transition-colors duration-200"
            >
              Add to Basket
            </button>

            {/* Visualiser link */}
            <Link
              href="/visualiser"
              className="mt-3 w-full py-3.5 border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-[0.3em] uppercase flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-colors duration-200"
            >
              View in 3D Visualiser
            </Link>

            {/* Specifications */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-5">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">
                  Specifications
                </p>
                <div className="flex-1 h-px bg-[#E8E5E0]" />
              </div>

              <div className="border border-[#E8E5E0] bg-white px-5 py-1">
                <SpecRow
                  label="Price per Tile"
                  value={pricePerTile !== null ? `£${pricePerTile}` : null}
                />
                <SpecRow
                  label="Price per Box"
                  value={pricePerBox !== null ? `£${pricePerBox}` : null}
                />
                <SpecRow label="m² per Box" value={coveragePerBox ? `${coveragePerBox} m²` : null} />
                <SpecRow label="Tiles per Box" value={product.tiles_per_box} />
                <SpecRow label="Tile Thickness" value={product.tile_thickness_mm ? `${product.tile_thickness_mm} mm` : null} />
                <SpecRow label="Material" value={product.material} />
                <SpecRow
                  label="Colour"
                  value={
                    Array.isArray(product.color)
                      ? product.color.join(", ")
                      : product.color
                  }
                />
                <SpecRow
                  label="Finish"
                  value={selectedFinish || finishList.join(", ") || null}
                />
                <SpecRow
                  label="Applications"
                  value={
                    Array.isArray(product.application)
                      ? product.application.join(", ")
                      : product.application
                  }
                />
                <SpecRow
                  label="Suitable Rooms"
                  value={
                    Array.isArray(product.suitable_room)
                      ? product.suitable_room.join(", ")
                      : product.suitable_room
                  }
                />
                <SpecRow label="Indoor / Outdoor" value={product.indoor_outdoor} />
                <SpecRow label="Weight per Box" value={weightPerBox ? `${weightPerBox} kg` : null} />
                <SpecRow label="Boxes in Stock" value={product.boxes_in_stock} />
                <SpecRow label="Lead Time" value={product.lead_time_days ? `${product.lead_time_days} days` : null} />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* You May Also Like */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-[#E8E5E0] bg-white">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-16">
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-1 h-px bg-[#E8E5E0]" />
              <h2 className="text-[11px] tracking-[0.3em] uppercase text-[#9A7A5E] font-medium shrink-0">
                You May Also Like
              </h2>
              <div className="flex-1 h-px bg-[#E8E5E0]" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp: any) => {
                const imgs = Array.isArray(rp.product_images)
                  ? [...rp.product_images].sort(
                      (a: any, b: any) =>
                        (a?.sort_order ?? 999) - (b?.sort_order ?? 999)
                    )
                  : [];
                const img = imgs[0]?.url ?? null;
                const rpSlug = (rp.slug || rp.id || "").trim();
                const href = rpSlug
                  ? `/products/${encodeURIComponent(rpSlug)}`
                  : "#";

                return (
                  <Link key={rp.id} href={href} className="group block">
                    <div
                      className="relative w-full overflow-hidden bg-[#EEECE9]"
                      style={{ aspectRatio: "4 / 5" }}
                    >
                      <ProductImage
                        src={img}
                        alt={rp.title ?? ""}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-3 px-0.5">
                      {rp.dimension_string && (
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] mb-1">
                          {rp.dimension_string}
                        </p>
                      )}
                      <p className="text-sm text-[#1A1A1A] font-light leading-snug tracking-wide">
                        {rp.title || "Untitled product"}
                      </p>
                      {rp.price_per_m2 && (
                        <p className="mt-1 text-xs text-[#6B6B6B] tracking-wide">
                          £{rp.price_per_m2} / m²
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
