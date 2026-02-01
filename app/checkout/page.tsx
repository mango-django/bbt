"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import { findShippingRate, isValidUKPostcode } from "@/lib/shipping";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, totalWeight } = useCart();

  // Redirect if basket is empty
  useEffect(() => {
    if (!cart || cart.length === 0) router.push("/cart");
  }, [cart]);

  

  /* ------------------------------------------
     FORM FIELDS
  ------------------------------------------ */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");

  /* ------------------------------------------
     SHIPPING + TOTALS
  ------------------------------------------ */

  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [postcodeError, setPostcodeError] = useState("");

  useEffect(() => {
    if (!isValidUKPostcode(postcode)) return;

    const rate = findShippingRate(totalWeight);
    setShippingCost(typeof rate === "number" ? rate : null);

  }, [postcode, totalWeight]);

  const vat = total * 0.2;
  const beforeDelivery = total + vat;
  const finalTotal =
    shippingCost !== null ? beforeDelivery + shippingCost : beforeDelivery;

  /* ------------------------------------------
     VALIDATE FORM
  ------------------------------------------ */
  function validateForm() {
    if (!fullName || !email || !phone || !address1 || !city || !postcode) {
      alert("Please fill in all required fields.");
      return false;
    }
    if (!isValidUKPostcode(postcode)) {
      alert("Invalid UK postcode.");
      return false;
    }
    return true;
  }

  /* ------------------------------------------
     CREATE STRIPE SESSION
  ------------------------------------------ */
  async function handleCheckout() {
  if (!validateForm()) return;
console.log("Checkout clicked");
  if (shippingCost === null) {
    alert("Enter a valid postcode to calculate delivery.");
    return;
  }
alert("You must be logged in to continue");
  const supabase = supabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔐 FORCE LOGIN
  if (!user) {
  localStorage.setItem("checkout_redirect", "/checkout");

  alert("Please sign in or create an account to complete checkout.");

  window.dispatchEvent(new CustomEvent("open-auth-modal"));
  return;
}


  const res = await fetch("/api/checkout/create-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: {
        user_id: user.id,
        fullName,
        email,
        phone,
        address1,
        address2,
        city,
        postcode,
      },
      cart,
      shippingCost,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    alert(errorText || "Checkout error.");
    return;
  }

  const data = await res.json();

  if (!data?.url) {
    alert("Checkout error.");
    return;
  }

  // ✅ Stripe redirect
  window.location.href = data.url;
}


  /* ------------------------------------------
     RENDER VIEW
  ------------------------------------------ */
  return (
    <main className="max-w-6xl mx-auto px-6 mt-10 mb-20 bg-white text-neutral-900">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* LEFT: CUSTOMER DETAILS */}
        <div className="lg:col-span-2 space-y-6">

          {/* CONTACT */}
          <section className="border p-6">
            <h2 className="text-xl font-semibold mb-4">Your Details</h2>

            <div className="space-y-4">
              <input
                className="w-full border p-3"
                placeholder="Full Name *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <input
                className="w-full border p-3"
                placeholder="Email Address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="w-full border p-3"
                placeholder="Phone Number *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </section>

          {/* ADDRESS */}
          <section className="border p-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>

            <div className="space-y-4">

              <input
                className="w-full border p-3"
                placeholder="Address Line 1 *"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
              />

              <input
                className="w-full border p-3"
                placeholder="Address Line 2 (Optional)"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
              />

              <input
                className="w-full border p-3"
                placeholder="Town / City *"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <input
                className="w-full border p-3"
                placeholder="Postcode *"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              />

              {postcodeError && (
                <p className="text-red-600 text-sm">{postcodeError}</p>
              )}

              {/* Recalculate shipping */}
              <button
                onClick={() => {
                  if (!isValidUKPostcode(postcode)) {
                    setPostcodeError("Invalid UK postcode.");
                    return;
                  }
                  setPostcodeError("");
                  const rate = findShippingRate(totalWeight);
                  setShippingCost(rate);
                }}
                className="mt-2 bg-blue-600 text-white px-4 py-2"
              >
                Update Delivery Cost
              </button>
            </div>
          </section>

        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <aside className="border p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <SummaryRow label="Subtotal:" amount={total} />
          <SummaryRow label="VAT (20%):" amount={vat} />
          <SummaryRow label="Total Before Delivery:" amount={beforeDelivery} />

          <div className="flex justify-between text-sm">
            <span>Delivery:</span>
            <span className="font-semibold">
              {shippingCost !== null ? `£${shippingCost.toFixed(2)}` : "Enter postcode"}
            </span>
          </div>

          <div className="border-t pt-4 flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>£{finalTotal.toFixed(2)}</span>
          </div>

          <button
          type="button"
          onClick={handleCheckout}
          disabled={shippingCost === null}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded disabled:bg-gray-400"
        >
          {shippingCost === null
            ? "Enter postcode to calculate delivery"
            : "Pay Securely with Stripe"}
        </button>


        </aside>
      </div>
    </main>
  );
}

/* ------------------------------------------
   SMALL COMPONENT
------------------------------------------ */
function SummaryRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span className="font-semibold">£{amount.toFixed(2)}</span>
    </div>
  );
}
