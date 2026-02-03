"use client";

import { useState } from "react";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

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
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
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
          body: JSON.stringify({
            paymentIntentId: result.paymentIntent.id,
            orderId,
          }),
        }).catch(() => undefined);
      }
      const query = orderId ? `?order_id=${encodeURIComponent(orderId)}` : "";
      window.location.href = `/checkout/success${query}`;
      return;
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <div className="border p-4 rounded">
        <CardElement />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-green-600 text-white py-3 rounded disabled:bg-gray-400"
      >
        {loading ? "Processing payment..." : "Pay now"}
      </button>
    </form>
  );
}
