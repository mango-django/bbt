"use client";

import Link from "next/link";

export default function WoodPlankCard({ plank }: { plank: any }) {
  const images = Array.isArray(plank.images) ? plank.images : [];
  const mainImage = images[0] || "/hero-placeholder.jpg";

  const slug = plank.slug?.trim();
  const fallbackId = plank.id ? String(plank.id) : "";
  const target = slug || fallbackId;
  const href = target ? `/wood-planks/${encodeURIComponent(target)}` : "#";

  return (
    <Link
      href={`/wood-planks/${plank.slug}`}
      className="block border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition bg-white"
    >
      {/* IMAGE */}
      <div className="w-full h-56 bg-gray-100 relative">
        <img
          src={mainImage}
          alt={plank.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* CONTENT */}
      <div className="p-5 space-y-4 bg-white text-[#2d2d2d]">
        {/* TITLE */}
        <h3 className="font-medium text-lg leading-snug text-[#1f1f1f]">
          {plank.title}
        </h3>

        {/* PRICE */}
        <p className="text-blue-600 font-semibold text-sm">
          £{plank.price_per_box} / box
        </p>

        {/* COVERAGE */}
        <div className="text-sm text-neutral-600">
          <span className="text-xs uppercase tracking-wide text-neutral-400 block mb-1">
            Coverage
          </span>
          <span className="text-base font-normal text-neutral-700">
            {plank.coverage_per_box} m² per box
          </span>
        </div>
      </div>
    </Link>
  );
}
