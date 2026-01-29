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

  /* ------------------------------------------------------
     AUTO UPDATE SHIPPING WHEN CART WEIGHT CHANGES
  ------------------------------------------------------ */
  useEffect(() => {
    if (!postcode || !isValidUKPostcode(postcode)) return;
    const rate = findShippingRate(totalWeight);
    setShippingCost(rate);
  }, [totalWeight, postcode]);

  /* ------------------------------------------------------
     MANUAL SHIPPING BUTTON
  ------------------------------------------------------ */
  const handleShippingCalc = () => {
    if (!isValidUKPostcode(postcode)) {
      setPostcodeError("Invalid UK postcode.");
      setShippingCost(null);
      return;
    }

    setPostcodeError("");
    setShippingCost(findShippingRate(totalWeight));
  };

  /* ------------------------------------------------------
     QUANTITY UPDATE LOGIC
     ------------------------------------------------------ */
  const updateQuantity = (item: any, newValue: number) => {
    if (newValue < 1) return;

    if (item.productType === "tile") {
      updateItem(item.id, { m2: newValue });
    } else {
      updateItem(item.id, { quantity: newValue });
    }
  };

  /* ------------------------------------------------------
     CALCULATE TOTALS
  ------------------------------------------------------ */
  const vat = total * 0.2;
  const beforeDelivery = total + vat;
  const finalTotal =
    shippingCost !== null ? beforeDelivery + shippingCost : beforeDelivery;

  /* ------------------------------------------------------
     EMPTY CART VIEW
  ------------------------------------------------------ */
  if (isEmpty) {
    return (
      <main className="max-w-7xl mx-auto px-4 mt-10 mb-20 bg-white text-neutral-900">
        <h1 className="text-3xl font-bold mb-8">Your Basket</h1>
        <div className="text-center py-20">
          <p className="text-lg text-neutral-700 mb-6">Your basket is empty.</p>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------
     FULL CART VIEW
  ------------------------------------------------------ */
  return (
    <main className="max-w-7xl mx-auto px-4 mt-10 bg-white text-neutral-900">
      <h1 className="text-3xl font-bold mb-8">Your Basket</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN — ITEMS */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => {
           const isTile = item.productType === "tile";
const isWoodPlank = item.productType === "wood_plank";

            const boxesRequired =
  isTile || isWoodPlank
    ? Math.ceil((item.m2 ?? 0) / (item.coverage ?? 1))
    : 0;

            return (
              <div
                key={item.id}
                className="border border-gray-200 p-4 bg-white flex flex-col md:flex-row gap-6"
              >
                {/* IMAGE */}
                <div className="relative w-full md:w-40 h-40 rounded-lg overflow-hidden bg-gray-50">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* DETAILS */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{item.title}</h2>

                  {item.finish && (
                    <p className="text-neutral-600 text-sm mb-2">
                      Finish: <strong>{item.finish}</strong>
                    </p>
                  )}

                  {/* PRICE LINE */}
                  <p className="text-neutral-700 font-semibold mb-4">
                  {isTile && `£${item.price_per_m2} per m²`}
                  {isWoodPlank && `£${item.price_per_box} per pack`}
                  {!isTile && !isWoodPlank && `£${(item.price_each ?? 0).toFixed(2)} each`}
                </p>

                  {/* QUANTITY UI */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">
                      {isTile ? "Square Metres:" : "Quantity:"}
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-200 overflow-hidden">
                        <button
                          className="px-3 py-2 border-r"
                          onClick={() =>
                            updateQuantity(
                              item,
                              isTile ? (item.m2 ?? 1) - 1 : item.quantity - 1
                            )
                          }
                        >
                          <FiMinus />
                        </button>

                        <input
                          type="number"
                          min={1}
                          value={isTile ? item.m2 ?? 1 : item.quantity}
                          className="w-20 text-center py-2 bg-white"
                          onChange={(e) =>
                            updateQuantity(item, Number(e.target.value))
                          }
                        />

                        <button
                          className="px-3 py-2 border-l"
                          onClick={() =>
                            updateQuantity(
                              item,
                              isTile ? (item.m2 ?? 0) + 1 : item.quantity + 1
                            )
                          }
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>

                    {/* TILE ONLY: BOX COUNT */}
                    {(isTile || isWoodPlank) && (
  <p className="text-sm text-gray-600 mt-1">
    Packs Required: <strong>{boxesRequired}</strong>
  </p>
)}
                  </div>

                  {/* REMOVE */}
                  <button
                    className="text-red-600 hover:text-red-800 flex items-center gap-2"
                    onClick={() => removeItem(item.id)}
                  >
                    <FiTrash2 /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN — SUMMARY */}
        <div className="border border-gray-200 p-6 bg-white h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <SummaryRow label="Subtotal:" value={`£${total.toFixed(2)}`} />
          <SummaryRow label="VAT (20%):" value={`£${vat.toFixed(2)}`} />
          <SummaryRow label="Total (Before Delivery):" value={`£${beforeDelivery.toFixed(2)}`} />

          {/* DELIVERY */}
          <div className="mt-6 p-4 border rounded-lg bg-neutral-50">
            <p className="font-medium mb-2">Delivery Estimate</p>

            <p className="text-sm text-neutral-700 mb-4">
              Total weight: <strong>{totalWeight.toFixed(1)} kg</strong>
            </p>

            <input
              type="text"
              placeholder="e.g. SW1A 1AA"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              className="border rounded-lg w-full px-3 py-2 mb-2"
            />

            {postcodeError && (
              <p className="text-red-600 text-sm mb-2">{postcodeError}</p>
            )}

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
              onClick={handleShippingCalc}
            >
              Calculate Delivery
            </button>

            {shippingCost !== null && (
              <p className="mt-4 text-neutral-900 font-semibold">
                Delivery Cost: £{shippingCost.toFixed(2)}
              </p>
            )}
          </div>

          <div className="border-t mt-6 pt-4 flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>£{finalTotal.toFixed(2)}</span>
          </div>

          <Link
            href="/checkout"
            className="block mt-6 bg-blue-900 hover:bg-blue-800 text-white text-center py-3 rounded-lg font-semibold"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ----------------------- REUSABLE SUMMARY ROW ----------------------- */
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm mb-2">
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
