"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CopyTrackingButton from "@/components/account/CopyTrackingButton";
import DeleteDraftOrderButton from "@/components/account/DeleteDraftOrderButton";
import AddDraftOrderToCartButton from "@/components/account/AddDraftOrderToCartButton";

type AccountOrder = {
  id: string;
  order_ref: string | null;
  status: string | null;
  total: number | null;
  created_at: string;
  tracking_number: string | null;
  items?: unknown[];
};

export default function AccountOrdersTable({
  initialOrders,
  deleteAction,
}: {
  initialOrders: AccountOrder[];
  deleteAction: (orderId: string) => Promise<void>;
}) {
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  return (
    <div className="bg-white shadow rounded overflow-x-auto text-neutral-700">
      <table className="w-full text-sm text-neutral-700">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Order</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Tracking</th>
            <th className="p-3 text-right">Total</th>
            <th className="p-3 text-right"></th>
          </tr>
        </thead>

        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-neutral-700">
                You haven’t placed any orders yet.
              </td>
            </tr>
          )}

          {orders.map((order) => (
            <tr key={order.id} className="border-t">
              <td className="p-3 font-mono text-xs">
                {order.order_ref || `${order.id.slice(0, 8)}…`}
              </td>

              <td className="p-3">
                {new Date(order.created_at).toLocaleDateString()}
              </td>

              <td className="p-3 capitalize">{order.status}</td>

              <td className="p-3">
                {order.tracking_number ? (
                  <CopyTrackingButton value={order.tracking_number} />
                ) : (
                  <span className="text-xs text-neutral-700">—</span>
                )}
              </td>

              <td className="p-3 text-right font-medium">
                £{order.total?.toFixed(2) ?? "0.00"}
              </td>

              <td className="p-3 text-right">
                <div className="flex justify-end gap-4">
                  <Link href={`/account/orders/${order.id}`} className="underline">
                    View
                  </Link>

                  {String(order.status).toLowerCase() === "draft" && (
                    <>
                      {Array.isArray(order.items) && order.items.length > 0 && (
                        <AddDraftOrderToCartButton items={order.items} />
                      )}

                      <DeleteDraftOrderButton
                        orderId={order.id}
                        deleteAction={deleteAction}
                        onDeleted={(deletedOrderId) => {
                          setOrders((prev) =>
                            prev.filter((existingOrder) => existingOrder.id !== deletedOrderId)
                          );
                        }}
                      />
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
