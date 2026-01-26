import { Suspense } from "react";
import CheckoutSuccessClient from "./CheckoutSuccessClient";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-semibold">Finalizing your order…</h1>
          <p className="text-gray-600 mt-3">Please wait a moment.</p>
        </main>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  );
}
