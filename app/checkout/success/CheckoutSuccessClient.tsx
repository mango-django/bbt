"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
        if (!res.ok || !data.success) throw new Error(data.error || "Order lookup failed");
        setOrder(data.order);
        setItems(data.items || []);
        clearCart();
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
      <main className="bg-[#FAFAF8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#9A7A5E] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#9A7A5E]">Finalizing your order…</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="bg-[#FAFAF8] min-h-screen">
        <div className="max-w-[700px] mx-auto px-6 sm:px-8 py-32 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#9A7A5E] mb-4">Order Not Found</p>
          <h1 className="text-3xl font-light tracking-wider text-[#1A1A1A] mb-3">{error || "Something went wrong"}</h1>
          <div className="w-10 h-px bg-[#D4CFC8] mx-auto mb-10" />
          <Link
            href="/"
            className="inline-block px-10 py-4 bg-[#1A1A1A] text-white text-[10px] tracking-[0.3em] uppercase hover:bg-[#2A2A2A] transition-colors"
          >
            Return Home
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
            <span className="text-[#1A1A1A]">Order Confirmed</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 sm:px-8 py-16">

        {/* Confirmation header */}
        <div className="text-center mb-14">
          <div className="w-14 h-14 border border-[#9A7A5E] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden>
              <path d="M1 8L8 15L21 1" stroke="#9A7A5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#9A7A5E] mb-3">Order Confirmed</p>
          <h1 className="text-3xl sm:text-4xl font-light tracking-wider text-[#1A1A1A] mb-2">
            Thank you, {order.customer_name?.split(" ")[0] ?? ""}
          </h1>
          <div className="w-10 h-px bg-[#D4CFC8] mx-auto mt-4 mb-5" />
          <p className="text-sm text-[#6B6B6B]">
            We've received your order and will be in touch shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Items ordered */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">Items Ordered</p>
              <div className="flex-1 h-px bg-[#E8E5E0]" />
            </div>
            <div className="bg-white border border-[#E8E5E0]">
              {items.length === 0 ? (
                <p className="px-6 py-8 text-sm text-[#6B6B6B] text-center">No items found</p>
              ) : (
                items.map((item, i) => (
                  <div key={item.id} className={`flex gap-4 px-5 py-4 ${i < items.length - 1 ? "border-b border-[#E8E5E0]" : ""}`}>
                    <div className="relative w-14 h-14 shrink-0 bg-[#EEECE9] overflow-hidden">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="w-full h-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-light text-[#1A1A1A]">{item.title}</p>
                      {item.finish && <p className="text-[10px] text-[#6B6B6B] mt-0.5">Finish: {item.finish}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Order totals */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">Summary</p>
              <div className="flex-1 h-px bg-[#E8E5E0]" />
            </div>

            <div className="bg-white border border-[#E8E5E0] px-5 py-4 mb-4">
              <div className="grid grid-cols-5 gap-4 py-2 border-b border-[#E8E5E0]">
                <p className="col-span-3 text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">Subtotal</p>
                <p className="col-span-2 text-sm font-light text-[#1A1A1A] text-right">
                  £{(order.total - order.vat - order.shipping_cost).toFixed(2)}
                </p>
              </div>
              <div className="grid grid-cols-5 gap-4 py-2 border-b border-[#E8E5E0]">
                <p className="col-span-3 text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">VAT</p>
                <p className="col-span-2 text-sm font-light text-[#1A1A1A] text-right">£{order.vat.toFixed(2)}</p>
              </div>
              <div className="grid grid-cols-5 gap-4 py-2">
                <p className="col-span-3 text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">Delivery</p>
                <p className="col-span-2 text-sm font-light text-[#1A1A1A] text-right">£{order.shipping_cost.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white border border-[#E8E5E0] px-5 py-4 mb-8">
              <div className="flex justify-between items-baseline">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E]">Total Paid</p>
                <p className="text-xl font-light text-[#1A1A1A]">£{order.total.toFixed(2)}</p>
              </div>
            </div>

            <Link
              href="/"
              className="block w-full py-4 bg-[#1A1A1A] text-white text-[10px] tracking-[0.3em] uppercase text-center hover:bg-[#2A2A2A] transition-colors duration-200 mb-3"
            >
              Back to Home
            </Link>
            <Link
              href="/tiles"
              className="block w-full py-4 border border-[#1A1A1A] text-[#1A1A1A] text-[10px] tracking-[0.3em] uppercase text-center hover:bg-[#1A1A1A] hover:text-white transition-colors duration-200"
            >
              Continue Shopping
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
