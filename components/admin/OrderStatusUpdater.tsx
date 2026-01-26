"use client";

import { useState } from "react";

type OrderStatus = "processing" | "dispatched" | "delivered";

export default function OrderStatusUpdater({
  orderId,
  status,
  trackingNumber,
}: {
  orderId: string;
  status: OrderStatus;
  trackingNumber?: string | null;
}) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(status);
  const [currentTracking, setCurrentTracking] = useState(
    trackingNumber ?? ""
  );

  async function updateOrderStatus() {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: currentStatus,
        tracking_number: currentTracking || null,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.error || "Failed to update order");
      return;
    }

    alert("Order updated successfully");
    window.location.reload();
  }

  return (
    <div className="bg-white shadow rounded p-6 space-y-4 max-w-md">
      <h3 className="font-semibold text-lg">Update Order</h3>

      <select
        className="w-full border p-2 rounded"
        value={currentStatus}
        onChange={(e) => setCurrentStatus(e.target.value as OrderStatus)}
      >
        <option value="processing">Processing</option>
        <option value="dispatched">Dispatched</option>
        <option value="delivered">Delivered</option>
      </select>

      <input
        type="text"
        placeholder="Tracking number"
        value={currentTracking}
        onChange={(e) => setCurrentTracking(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <button
        type="button"
        onClick={updateOrderStatus}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Update
      </button>
    </div>
  );
}
