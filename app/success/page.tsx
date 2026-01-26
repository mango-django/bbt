import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto p-10 text-center space-y-4">
          <h1 className="text-2xl font-bold">Payment Successful 🎉</h1>
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
