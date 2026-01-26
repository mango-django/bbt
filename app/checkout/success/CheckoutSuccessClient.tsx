"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const order_id = searchParams.get("order_id");
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!order_id) {
      setError("Missing order reference.");
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch("/api/orders/get-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Order lookup failed");
        }

        setOrder(data.order);
        setItems(data.items || []);
        clearCart(); // ✅ clear cart only after success
      } catch (err: any) {
        setError(err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [order_id, clearCart]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold">Finalizing your order…</h1>
        <p className="text-gray-600 mt-3">Please wait a moment.</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold text-red-600">Order Not Found</h1>
        <p className="mt-3 text-gray-700">{error}</p>
        <Link href="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg">
          Return Home
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-green-600">Order Confirmed</h1>
      <p className="text-gray-700 mt-2">
        Thank you for your purchase, <strong>{order.customer_name}</strong>!
      </p>

      <div className="mt-10 border rounded-lg p-6 bg-white shadow">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        <p><strong>Total:</strong> £{order.total.toFixed(2)}</p>
        <p><strong>Delivery:</strong> £{order.shipping_cost.toFixed(2)}</p>
        <p><strong>VAT:</strong> £{order.vat.toFixed(2)}</p>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Items</h3>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="border p-3 rounded bg-gray-50">
                <strong>{item.title}</strong>
                {item.finish && <> — {item.finish}</>}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
