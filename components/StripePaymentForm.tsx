"use client";

import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function StripePaymentForm({
  clientSecret,
  orderId,
}: {
  clientSecret: string;
  orderId: string | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! },
    });

    if (result.error) {
      setError(result.error.message || "Payment failed");
      setLoading(false);
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      if (orderId) {
        await fetch("/api/checkout/confirm-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: result.paymentIntent.id, orderId }),
        }).catch(() => undefined);
      }
      const query = orderId ? `?order_id=${encodeURIComponent(orderId)}` : "";
      window.location.href = `/checkout/success${query}`;
      return;
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-2">

      {/* Card element */}
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] mb-3">Card Details</p>
        <div className="border border-[#D4CFC8] bg-white px-4 py-3 focus-within:border-[#9A7A5E] transition-colors">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  color: "#1A1A1A",
                  fontFamily: "inherit",
                  fontWeight: "300",
                  "::placeholder": { color: "#C4C0BB" },
                },
                invalid: { color: "#dc2626" },
              },
            }}
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 bg-[#1A1A1A] text-white text-[10px] tracking-[0.3em] uppercase hover:bg-[#2A2A2A] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Processing Payment..." : "Pay Now"}
      </button>

      <p className="text-[10px] text-[#C4BFB9] tracking-wide text-center">
        SSL encrypted · Powered by Stripe
      </p>
    </form>
  );
}
