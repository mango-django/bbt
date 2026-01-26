"use client";

import Link from "next/link";

export default function ProductCard({ product }: { product: any }) {
  const productImages = Array.isArray(product.product_images)
    ? product.product_images
    : [];
  const sortedImages = [...productImages].sort(
    (a, b) => (a?.sort_order ?? 999) - (b?.sort_order ?? 999)
  );
  const mainImage = sortedImages[0]?.url || "/hero-placeholder.jpg";

  // Structured fields
  const size = product.dimension_string;
  const price = product.price_per_m2;

  const slug = (product.slug || product.id || "").trim();
  const productHref = slug ? `/products/${encodeURIComponent(slug)}` : "#";

  return (
    <Link
      href={productHref}
      className="block border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition bg-white"
    >
      {/* IMAGE */}
      <div className="w-full h-56 bg-gray-100 relative">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5 space-y-4 bg-white text-[#2d2d2d]">
        {/* TITLE */}
        <h3 className="font-medium text-lg leading-snug text-[#1f1f1f]">
          {product.title || "Untitled product"}
        </h3>

        {/* PRICE */}
        {price && (
          <p className="text-blue-600 font-semibold text-sm">
            £{price} / m²
          </p>
        )}

        {/* TILE SIZE */}
        {size && (
          <div className="text-sm text-neutral-600">
            <span className="text-xs uppercase tracking-wide text-neutral-400 block mb-1">
              Tile Size
            </span>
            <span className="text-base font-normal text-neutral-700">
              {size}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
