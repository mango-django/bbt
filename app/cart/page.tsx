"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { useCart } from "@/app/context/CartContext";
import { findShippingRate, isValidUKPostcode } from "@/lib/shipping";

export default function CartPage() {
  const { cart, updateItem, removeItem, total, totalWeight } = useCart();

  const [postcode, setPostcode] = useState("");
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [postcodeError, setPostcodeError] = useState("");

  const isEmpty = cart.length === 0;

  useEffect(() => {
    if (!postcode || !isValidUKPostcode(postcode)) return;
    const rate = findShippingRate(totalWeight);
    setShippingCost(rate);
  }, [totalWeight, postcode]);

  const handleShippingCalc = () => {
    if (!isValidUKPostcode(postcode)) {
      setPostcodeError("Invalid UK postcode.");
      setShippingCost(null);
      return;
    }
    setPostcodeError("");
    setShippingCost(findShippingRate(totalWeight));
  };

  const updateQuantity = (item: any, newValue: number) => {
    if (newValue < 1) return;
    if (item.productType === "tile") {
      updateItem(item.id, { m2: newValue });
    } else {
      updateItem(item.id, { quantity: newValue });
    }
  };

  const vat = total * 0.2;
  const beforeDelivery = total + vat;
  const finalTotal = shippingCost !== null ? beforeDelivery + shippingCost : beforeDelivery;

  if (isEmpty) {
    return (
      <main className="bg-[#FAFAF8] min-h-screen">
        <div className="border-b border-[#E8E5E0] bg-white">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-4">
            <nav className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase">
              <Link href="/" className="text-[#9A7A5E] hover:text-[#7A5E44] transition-colors">Home</Link>
              <span className="text-[#D4CFC8]">/</span>
              <span className="text-[#1A1A1A]">Basket</span>
            </nav>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-32 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#9A7A5E] mb-4">Your Basket</p>
          <h1 className="text-3xl font-light tracking-wider text-[#1A1A1A] mb-3">Nothing here yet</h1>
          <div className="w-10 h-px bg-[#D4CFC8] mx-auto mb-8" />
          <p className="text-sm text-[#6B6B6B] mb-10">Browse our collection and add tiles or products to your basket.</p>
          <Link
            href="/tiles"
            className="inline-block px-10 py-4 bg-[#1A1A1A] text-white text-[10px] tracking-[0.3em] uppercase hover:bg-[#2A2A2A] transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#FAFAF8] min-h-screen">

      {/* Breadcrumb */}
      <div className="border-b border-[#E8E5E0] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-4">
          <nav className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase">
            <Link href="/" className="text-[#9A7A5E] hover:text-[#7A5E44] transition-colors">Home</Link>
            <span className="text-[#D4CFC8]">/</span>
            <span className="text-[#1A1A1A]">Basket</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#9A7A5E] mb-2">Review</p>
          <h1 className="text-3xl sm:text-4xl font-light tracking-wider text-[#1A1A1A]">Your Basket</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 xl:gap-16">

          {/* LEFT — items */}
          <div className="lg:col-span-2 space-y-4">

            {/* Column labels */}
            <div className="hidden sm:grid grid-cols-5 gap-4 pb-3 border-b border-[#E8E5E0]">
              <p className="col-span-2 text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">Product</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">Unit Price</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] text-center">Quantity</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] text-right">Subtotal</p>
            </div>

            {cart.map((item) => {
              const isTile = item.productType === "tile";
              const isWoodPlank = item.productType === "wood_plank";
              const boxesRequired = (isTile || isWoodPlank)
                ? Math.ceil((item.m2 ?? 0) / (item.coverage ?? 1))
                : 0;
              const currentQty = isTile ? (item.m2 ?? 1) : item.quantity;
              const unitPrice = isTile
                ? item.price_per_m2
                : isWoodPlank
                ? item.price_per_box
                : (item.price_each ?? 0);
              const lineTotal = isTile
                ? (item.price_per_m2 ?? 0) * (item.m2 ?? 0)
                : isWoodPlank
                ? (item.price_per_box ?? 0) * boxesRequired
                : (item.price_each ?? 0) * item.quantity;

              return (
                <div key={item.id} className="bg-white border border-[#E8E5E0] p-5 flex gap-5">
                  {/* Thumbnail */}
                  <div className="relative w-24 h-24 shrink-0 bg-[#EEECE9] overflow-hidden">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill className="object-cover" sizes="96px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-[10px] tracking-widest uppercase text-[#9A7A5E]">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] mb-1">
                          {isTile ? "Tile" : isWoodPlank ? "Wood Plank" : "Installation"}
                        </p>
                        <h2 className="text-sm font-light tracking-wide text-[#1A1A1A]">{item.title}</h2>
                        {item.finish && (
                          <p className="text-[10px] text-[#6B6B6B] mt-0.5">Finish: {item.finish}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#C4BFB9] hover:text-[#9A7A5E] transition-colors shrink-0 mt-0.5"
                        aria-label="Remove item"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                      {/* Unit price */}
                      <div>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-[#9A7A5E] mb-1">Price</p>
                        <p className="text-sm font-light text-[#1A1A1A]">
                          £{Number(unitPrice).toFixed(2)}{isTile ? " / m²" : isWoodPlank ? " / pack" : " each"}
                        </p>
                      </div>

                      {/* Quantity stepper */}
                      <div>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-[#9A7A5E] mb-1">
                          {isTile ? "m²" : "Qty"}
                        </p>
                        <div className="flex items-center border border-[#D4CFC8]">
                          <button
                            className="w-8 h-8 flex items-center justify-center border-r border-[#D4CFC8] text-[#1A1A1A] hover:bg-[#FAFAF8] transition-colors"
                            onClick={() => updateQuantity(item, currentQty - 1)}
                          >
                            <FiMinus size={10} />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={currentQty}
                            onChange={(e) => updateQuantity(item, Number(e.target.value))}
                            className="w-14 text-center text-sm font-light text-[#1A1A1A] bg-transparent py-1.5 focus:outline-none"
                          />
                          <button
                            className="w-8 h-8 flex items-center justify-center border-l border-[#D4CFC8] text-[#1A1A1A] hover:bg-[#FAFAF8] transition-colors"
                            onClick={() => updateQuantity(item, currentQty + 1)}
                          >
                            <FiPlus size={10} />
                          </button>
                        </div>
                        {(isTile || isWoodPlank) && (
                          <p className="text-[10px] text-[#9A7A5E] mt-1">{boxesRequired} pack{boxesRequired !== 1 ? "s" : ""}</p>
                        )}
                      </div>

                      {/* Line total */}
                      <div className="text-right">
                        <p className="text-[10px] tracking-[0.15em] uppercase text-[#9A7A5E] mb-1">Total</p>
                        <p className="text-sm font-light text-[#1A1A1A]">£{lineTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Continue shopping */}
            <div className="pt-4">
              <Link href="/tiles" className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] border-b border-[#9A7A5E] hover:text-[#7A5E44] hover:border-[#7A5E44] transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* RIGHT — summary */}
          <div className="h-fit">

            <div className="flex items-center gap-3 mb-6">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">Order Summary</p>
              <div className="flex-1 h-px bg-[#E8E5E0]" />
            </div>

            <div className="bg-white border border-[#E8E5E0] px-6 py-5 mb-4">
              <TotalRow label="Subtotal" value={`£${total.toFixed(2)}`} />
              <TotalRow label="VAT (20%)" value={`£${vat.toFixed(2)}`} />
              <TotalRow label="Before Delivery" value={`£${beforeDelivery.toFixed(2)}`} />
            </div>

            {/* Delivery */}
            <div className="bg-white border border-[#E8E5E0] px-6 py-5 mb-4">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mb-4">Delivery Estimate</p>
              <p className="text-xs text-[#6B6B6B] mb-4">
                Total weight: <span className="text-[#1A1A1A] font-light">{totalWeight.toFixed(1)} kg</span>
              </p>

              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] mb-2">Postcode</label>
              <input
                type="text"
                placeholder="e.g. SW1A 1AA"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                className="w-full border-0 border-b border-[#D4CFC8] pb-2 pt-1 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] transition-colors placeholder-[#C4C0BB] text-[#1A1A1A] mb-3"
              />

              {postcodeError && (
                <p className="text-red-500 text-xs mb-3">{postcodeError}</p>
              )}

              <button
                onClick={handleShippingCalc}
                className="w-full py-3 border border-[#1A1A1A] text-[#1A1A1A] text-[10px] tracking-[0.3em] uppercase hover:bg-[#1A1A1A] hover:text-white transition-colors duration-200"
              >
                Calculate Delivery
              </button>

              {shippingCost !== null && (
                <div className="mt-4 pt-4 border-t border-[#E8E5E0]">
                  <TotalRow label="Delivery" value={`£${shippingCost.toFixed(2)}`} />
                </div>
              )}
            </div>

            {/* Grand total */}
            <div className="bg-white border border-[#E8E5E0] px-6 py-5 mb-6">
              <div className="flex justify-between items-baseline">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E]">Total</p>
                <p className="text-xl font-light text-[#1A1A1A]">£{finalTotal.toFixed(2)}</p>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full py-4 bg-[#1A1A1A] text-white text-[10px] tracking-[0.3em] uppercase text-center hover:bg-[#2A2A2A] transition-colors duration-200 mb-3"
            >
              Proceed to Checkout
            </Link>

            <p className="text-[10px] text-[#C4BFB9] tracking-wide text-center">
              Secure checkout — SSL encrypted
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-5 gap-4 py-2.5 border-b border-[#E8E5E0] last:border-0">
      <p className="col-span-3 text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">{label}</p>
      <p className="col-span-2 text-sm font-light text-[#1A1A1A] text-right">{value}</p>
    </div>
  );
}
