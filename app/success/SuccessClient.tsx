"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessClient() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div className="max-w-xl mx-auto p-10 text-center space-y-4">
      <h1 className="text-2xl font-bold">Payment Successful 🎉</h1>

      <p>
        Thank you for your order. We’ve received your payment and will begin
        processing it shortly.
      </p>

      {sessionId && (
        <p className="text-sm text-gray-500">Reference: {sessionId}</p>
      )}
    </div>
  );
}
