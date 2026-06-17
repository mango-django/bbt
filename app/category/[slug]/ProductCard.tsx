"use client";

import Link from "next/link";
import ProductImage from "@/components/ProductImage";

export default function ProductCard({ product }: { product: any }) {
  const productImages = Array.isArray(product.product_images)
    ? product.product_images
    : [];
  const sortedImages = [...productImages].sort(
    (a, b) => (a?.sort_order ?? 999) - (b?.sort_order ?? 999)
  );
  const mainImage = sortedImages[0]?.url ?? null;

  const size = product.dimension_string as string | null;
  const price = product.price_per_m2 as string | null;
  const slug = (product.slug || product.id || "").trim();
  const productHref = slug ? `/products/${encodeURIComponent(slug)}` : "#";

  return (
    <Link href={productHref} className="group block">

      {/* Image — 4:5 portrait with hover zoom */}
      <div
        className="relative w-full overflow-hidden bg-[#EEECE9]"
        style={{ aspectRatio: "4 / 5" }}
      >
        <ProductImage
          src={mainImage}
          alt={product.title ?? ""}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      {/* Details */}
      <div className="mt-3 px-0.5">
        {size && (
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] mb-1">
            {size}
          </p>
        )}
        <p className="text-sm text-[#1A1A1A] font-light leading-snug tracking-wide">
          {product.title || "Untitled product"}
        </p>
        {price && (
          <p className="mt-1 text-xs text-[#6B6B6B] tracking-wide">
            £{price} / m²
          </p>
        )}
      </div>

    </Link>
  );
}
