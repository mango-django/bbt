"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import { findShippingRate, isValidUKPostcode } from "@/lib/shipping";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import StripePaymentForm from "@/components/StripePaymentForm";

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  optional = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] mb-2">
        {label}
        {optional && <span className="text-[#C4BFB9] normal-case tracking-normal ml-1">(optional)</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-0 border-b border-[#D4CFC8] pb-2 pt-1 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] transition-colors placeholder-[#C4C0BB] text-[#1A1A1A]"
      />
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, totalWeight } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!cart || cart.length === 0) router.push("/cart");
  }, [cart, router]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");

  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [postcodeError, setPostcodeError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isValidUKPostcode(postcode)) return;
    const rate = findShippingRate(totalWeight);
    setShippingCost(typeof rate === "number" ? rate : null);
  }, [postcode, totalWeight]);

  const vat = total * 0.2;
  const beforeDelivery = total + vat;
  const finalTotal = shippingCost !== null ? beforeDelivery + shippingCost : beforeDelivery;

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

  async function handleCheckout() {
    if (isSubmitting) return;
    if (!validateForm()) return;

    if (shippingCost === null) {
      alert("Enter a valid postcode to calculate delivery.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        localStorage.setItem("checkout_redirect", "/checkout");
        window.dispatchEvent(new CustomEvent("open-auth-modal"));
        alert("Please sign in or create an account to complete checkout.");
        return;
      }

      const res = await fetch("/api/checkout/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { user_id: user.id, fullName, email, phone, address1, address2, city, postcode },
          cart,
          shippingCost,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.clientSecret) {
        alert(data?.error || "Unable to prepare secure payment.");
        return;
      }

      setClientSecret(data.clientSecret);
      setOrderId(typeof data.orderId === "string" ? data.orderId : null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to start checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-[#FAFAF8] min-h-screen">

      {/* Breadcrumb */}
      <div className="border-b border-[#E8E5E0] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-4">
          <nav className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase">
            <Link href="/" className="text-[#9A7A5E] hover:text-[#7A5E44] transition-colors">Home</Link>
            <span className="text-[#D4CFC8]">/</span>
            <Link href="/cart" className="text-[#9A7A5E] hover:text-[#7A5E44] transition-colors">Basket</Link>
            <span className="text-[#D4CFC8]">/</span>
            <span className="text-[#1A1A1A]">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#9A7A5E] mb-2">Secure Checkout</p>
          <h1 className="text-3xl sm:text-4xl font-light tracking-wider text-[#1A1A1A]">Complete Your Order</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 xl:gap-16">

          {/* LEFT — form (3 cols) */}
          <div className="lg:col-span-3 space-y-10">

            {/* Your Details */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">Your Details</p>
                <div className="flex-1 h-px bg-[#E8E5E0]" />
              </div>
              <div className="bg-white border border-[#E8E5E0] px-6 py-7 space-y-6">
                <Field label="Full Name" placeholder="Jane Smith" value={fullName} onChange={setFullName} />
                <Field label="Email Address" placeholder="jane@example.com" value={email} onChange={setEmail} type="email" />
                <Field label="Phone Number" placeholder="+44 7000 000 000" value={phone} onChange={setPhone} type="tel" />
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">Delivery Address</p>
                <div className="flex-1 h-px bg-[#E8E5E0]" />
              </div>
              <div className="bg-white border border-[#E8E5E0] px-6 py-7 space-y-6">
                <Field label="Address Line 1" placeholder="123 Example Street" value={address1} onChange={setAddress1} />
                <Field label="Address Line 2" placeholder="Flat / Unit" value={address2} onChange={setAddress2} optional />
                <div className="grid grid-cols-2 gap-6">
                  <Field label="Town / City" placeholder="London" value={city} onChange={setCity} />
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] mb-2">Postcode</label>
                    <input
                      type="text"
                      placeholder="SW1A 1AA"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                      className="w-full border-0 border-b border-[#D4CFC8] pb-2 pt-1 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] transition-colors placeholder-[#C4C0BB] text-[#1A1A1A]"
                    />
                    {postcodeError && <p className="text-red-500 text-xs mt-1">{postcodeError}</p>}
                  </div>
                </div>
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
                  className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] border-b border-[#9A7A5E] hover:text-[#7A5E44] hover:border-[#7A5E44] transition-colors"
                >
                  Update Delivery Cost
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT — order summary + payment (2 cols) */}
          <div className="lg:col-span-2">

            {/* Section label */}
            <div className="flex items-center gap-3 mb-6">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">Order Summary</p>
              <div className="flex-1 h-px bg-[#E8E5E0]" />
            </div>

            {/* Cart items */}
            <div className="bg-white border border-[#E8E5E0] mb-4">
              {cart.map((item, i) => {
                const isTile = item.productType === "tile";
                const isWoodPlank = item.productType === "wood_plank";
                const boxesRequired = (isTile || isWoodPlank)
                  ? Math.ceil((item.m2 ?? 0) / (item.coverage ?? 1))
                  : 0;
                const lineTotal = isTile
                  ? (item.price_per_m2 ?? 0) * (item.m2 ?? 0)
                  : isWoodPlank
                  ? (item.price_per_box ?? 0) * boxesRequired
                  : (item.price_each ?? 0) * item.quantity;

                return (
                  <div key={item.id} className={`flex gap-4 px-5 py-4 ${i < cart.length - 1 ? "border-b border-[#E8E5E0]" : ""}`}>
                    <div className="relative w-14 h-14 shrink-0 bg-[#EEECE9] overflow-hidden">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="w-full h-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-light text-[#1A1A1A] truncate">{item.title}</p>
                      {item.finish && <p className="text-[10px] text-[#6B6B6B]">Finish: {item.finish}</p>}
                      <p className="text-[10px] text-[#9A7A5E] mt-1">
                        {isTile
                          ? `${item.m2} m²`
                          : isWoodPlank
                          ? `${boxesRequired} pack${boxesRequired !== 1 ? "s" : ""}`
                          : `Qty: ${item.quantity}`}
                      </p>
                    </div>
                    <p className="text-sm font-light text-[#1A1A1A] shrink-0">£{lineTotal.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="bg-white border border-[#E8E5E0] px-5 py-4 mb-4">
              <SummaryRow label="Subtotal" value={`£${total.toFixed(2)}`} />
              <SummaryRow label="VAT (20%)" value={`£${vat.toFixed(2)}`} />
              <SummaryRow
                label="Delivery"
                value={shippingCost !== null ? `£${shippingCost.toFixed(2)}` : "Enter postcode"}
              />
            </div>

            {/* Grand total */}
            <div className="bg-white border border-[#E8E5E0] px-5 py-4 mb-6">
              <div className="flex justify-between items-baseline">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E]">Total</p>
                <p className="text-xl font-light text-[#1A1A1A]">£{finalTotal.toFixed(2)}</p>
              </div>
            </div>

            {/* Stripe elements or CTA */}
            {clientSecret ? (
              <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm clientSecret={clientSecret} orderId={orderId} />
              </Elements>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={shippingCost === null || isSubmitting}
                  className="w-full py-4 bg-[#1A1A1A] text-white text-[10px] tracking-[0.3em] uppercase hover:bg-[#2A2A2A] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed mb-3"
                >
                  {isSubmitting
                    ? "Preparing Secure Payment..."
                    : shippingCost === null
                    ? "Enter Postcode to Continue"
                    : "Continue to Payment"}
                </button>
                <p className="text-[10px] text-[#C4BFB9] tracking-wide text-center">SSL encrypted · Powered by Stripe</p>
              </>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-5 gap-4 py-2 border-b border-[#E8E5E0] last:border-0">
      <p className="col-span-3 text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">{label}</p>
      <p className="col-span-2 text-sm font-light text-[#1A1A1A] text-right">{value}</p>
    </div>
  );
}
