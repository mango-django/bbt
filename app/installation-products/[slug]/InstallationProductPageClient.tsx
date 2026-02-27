"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import ProductGallery from "@/components/ProductGallery";

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

type InstallationProductPageClientProps = {
  product: any;
  images: Array<{ url?: string } | null>;
};

export default function InstallationProductPageClient({
  product,
  images,
}: InstallationProductPageClientProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  /* ----------------------------------------------
     NORMALISED VALUES
     ---------------------------------------------- */
  const price_each =
    Number(product?.price ?? product?.unit_price ?? product?.unit_amount ?? 0);

  const weight_each =
    Number(product?.weight ?? product?.item_weight ?? product?.unit_amount ?? 0);

  const normalizedImages = Array.isArray(images)
    ? images
        .filter(
          (img): img is { url?: string } =>
            !!img && typeof img === "object"
        )
        .map((img) => ({
          ...img,
          url: typeof img.url === "string" ? img.url : undefined,
        }))
    : [];

  const coverImage =
    normalizedImages.find((img) => img.url)?.url ||
    product?.main_image ||
    product?.image ||
    "/hero-placeholder.jpg";

  /* ----------------------------------------------
     ADD TO CART (installation format)
     ---------------------------------------------- */
  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      title: product.name,
      image: coverImage,
      productType: "installation",
      price_each,
      quantity,
      boxWeight: weight_each,
      m2: 0,
      coverage: 1,
      finish: undefined,
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
            <Link
              href="/installation-products"
              className="text-[#9A7A5E] hover:text-[#7A5E44] transition-colors"
            >
              Installation Products
            </Link>
            <span className="text-[#D4CFC8]">/</span>
            <span className="text-[#1A1A1A]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

          {/* LEFT — sticky gallery */}
          <div className="lg:sticky lg:top-6 self-start">
            <ProductGallery
              images={normalizedImages}
              title={product?.name ?? "Installation Product"}
            />
          </div>

          {/* RIGHT — product info */}
          <div>

            {/* Type + name */}
            <div className="mb-6">
              {product.product_type && (
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mb-2">
                  {product.product_type}
                </p>
              )}
              <h1 className="text-3xl sm:text-4xl font-light tracking-wider text-[#1A1A1A] leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1.5 mb-6">
              <span className="text-2xl font-light text-[#1A1A1A]">
                £{price_each.toFixed(2)}
              </span>
              {product.unit_type && (
                <span className="text-xs tracking-widest uppercase text-[#9A7A5E]">
                  / {product.unit_type}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-[#6B6B6B] leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            {/* Quantity selector */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">
                  Quantity
                </p>
                <div className="flex-1 h-px bg-[#E8E5E0]" />
              </div>
              <div className="flex items-center border border-[#D4CFC8] w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#9A7A5E] hover:bg-[#F5F2EE] transition-colors text-lg leading-none"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <div className="w-12 h-10 flex items-center justify-center text-sm text-[#1A1A1A] border-x border-[#D4CFC8]">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-[#9A7A5E] hover:bg-[#F5F2EE] transition-colors text-lg leading-none"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to basket */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 bg-[#1A1A1A] text-white text-xs tracking-[0.3em] uppercase hover:bg-[#2A2A2A] transition-colors duration-200"
            >
              Add to Basket
            </button>

            {/* Specifications */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-5">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">
                  Specifications
                </p>
                <div className="flex-1 h-px bg-[#E8E5E0]" />
              </div>

              <div className="border border-[#E8E5E0] bg-white px-5 py-1">
                <SpecRow label="Type" value={product.product_type} />
                <SpecRow label="Colour" value={product.colour} />
                <SpecRow
                  label="Unit"
                  value={
                    weight_each && product.unit_type
                      ? `${weight_each} ${product.unit_type.toUpperCase()}`
                      : null
                  }
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
