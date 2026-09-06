"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { packageExVatPrice, type PackageOffer } from "@/lib/offers";

export default function PackageOfferCard({
  offer,
  tileImages,
}: {
  offer: PackageOffer;
  tileImages: Record<string, string>;
}) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState(0);

  const colour = offer.colourOptions[selected];
  const image = tileImages[colour.productId] ?? "";
  const hasColourChoice = offer.colourOptions.length > 1;

  const addToBasket = () => {
    addItem({
      product_id: offer.id,
      title: `${offer.name} — ${offer.title}`,
      image,
      productType: "bundle",
      price_each: packageExVatPrice(offer),
      quantity: 1,
      boxWeight: offer.totalWeightKg,
      finish: colour.label,
      m2: 0,
      coverage: 1,
      contents: [
        `${offer.tileLine} — ${colour.label}`,
        ...offer.components.map((c) => c.label),
      ],
    });
  };

  return (
    <div className="group flex flex-col overflow-hidden">
      {/* Tile image */}
      <Link
        href={`/products/${colour.slug}`}
        className="relative h-[260px] sm:h-[340px] overflow-hidden bg-[#EEECE9] block"
      >
        {image ? (
          <Image
            src={image}
            alt={`${offer.title} — ${colour.label} tile`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[10px] tracking-widest uppercase text-[#9A7A5E]">
              No Image
            </span>
          </div>
        )}
        <div className="absolute top-5 left-5 bg-[#9A7A5E] text-white text-[11px] tracking-[0.3em] uppercase px-4 py-2">
          {offer.name}
        </div>
        {offer.nextDayDelivery && (
          <div className="absolute top-5 right-5 bg-[#151515]/80 backdrop-blur-sm text-white text-[10px] tracking-[0.2em] uppercase px-3 py-2">
            Next Day Delivery
          </div>
        )}
      </Link>

      {/* Details panel */}
      <div className="bg-[#151515] text-white flex-1 flex flex-col px-8 py-8 sm:px-10">
        <h2 className="text-2xl sm:text-3xl font-thin tracking-wider leading-tight mb-4">
          {offer.title}
          <br />
          <span className="italic text-white/60">Complete Package</span>
        </h2>

        {/* Contents */}
        <ul className="space-y-2 mb-6">
          {[offer.tileLine, ...offer.components.map((c) => c.label)].map(
            (line) => (
              <li
                key={line}
                className="flex items-baseline gap-3 text-sm text-white/70"
              >
                <span className="w-3 h-px bg-[#9A7A5E] shrink-0 translate-y-[-3px]" />
                {line}
              </li>
            )
          )}
          {offer.nextDayDelivery && (
            <li className="flex items-baseline gap-3 text-sm text-white/70">
              <span className="w-3 h-px bg-[#9A7A5E] shrink-0 translate-y-[-3px]" />
              Next day delivery if ordered before 11:30am
            </li>
          )}
        </ul>

        {/* Colour selector */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-white/40 mb-3">
            {hasColourChoice ? "Choose Your Colour" : "Colour"}
          </p>
          <div className="flex flex-wrap gap-2">
            {offer.colourOptions.map((option, i) => (
              <button
                key={option.productId}
                onClick={() => setSelected(i)}
                className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase border transition-colors duration-200 ${
                  i === selected
                    ? "bg-[#9A7A5E] border-[#9A7A5E] text-white"
                    : "border-white/25 text-white/60 hover:border-white/50 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl sm:text-4xl font-thin tracking-wide">
              £{offer.priceIncVat.toFixed(2)}
            </span>
            <span className="text-sm text-white/60 tracking-wide">
              inc. VAT
            </span>
          </div>
          {offer.savingIncVat ? (
            <p className="text-sm text-white/40 tracking-wide mb-6">
              Was{" "}
              <span className="line-through">
                £{(offer.priceIncVat + offer.savingIncVat).toFixed(2)}
              </span>{" "}
              — total saving £{offer.savingIncVat.toFixed(2)}
            </p>
          ) : (
            <div className="mb-6" />
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={addToBasket}
              className="px-8 py-3.5 bg-white text-[#151515] text-[10px] tracking-[0.3em] uppercase hover:bg-[#9A7A5E] hover:text-white transition-colors duration-200"
            >
              Add Package to Basket
            </button>
            <Link
              href={`/products/${colour.slug}`}
              className="inline-flex items-center gap-3 text-xs tracking-widest uppercase text-white/60 hover:text-white transition-colors"
            >
              View the Tile
              <span className="w-6 h-px bg-white/40" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
