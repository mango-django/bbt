import { supabaseAdmin, requireAdmin } from "@/lib/supabase/admin";
import Link from "next/link";

 

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return (
      <div className="p-6 text-red-600">
        {auth.error}
      </div>
    );
  }

  const supabase = await supabaseAdmin();
  const params = await searchParams;
  const rawQuery = params?.q;
  const searchQuery =
    typeof rawQuery === "string"
      ? rawQuery.trim()
      : Array.isArray(rawQuery)
      ? rawQuery[0]?.trim()
      : "";

  const STATUSES = ["draft", "paid", "dispatched", "delivered", "refunded"];
  const rawStatus = params?.status;
  const statusFilter =
    typeof rawStatus === "string" && STATUSES.includes(rawStatus)
      ? rawStatus
      : "";

  let query = supabase
    .from("orders")
    .select(`
      id,
      order_ref,
      customer_name,
      customer_email,
      status,
      subtotal,
      vat,
      shipping_cost,
      total,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.or(
      `order_ref.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,id.ilike.%${searchQuery}%`
    );
  }

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("ORDERS LOAD ERROR:", error);
    return (
      <div className="p-6 text-red-600">
        Failed to load orders.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <form className="w-full md:w-80" action="/admin/orders" method="get">
          {statusFilter && (
            <input type="hidden" name="status" value={statusFilter} />
          )}
          <input
            type="search"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search order ID or customer name..."
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
        </form>
      </div>

      {/* STATUS FILTER */}
      <div className="flex flex-wrap items-center gap-2">
        {["", ...STATUSES].map((status) => {
          const qs = new URLSearchParams();
          if (searchQuery) qs.set("q", searchQuery);
          if (status) qs.set("status", status);
          const href = `/admin/orders${qs.size ? `?${qs}` : ""}`;
          const active = status === statusFilter;
          return (
            <Link
              key={status || "all"}
              href={href}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {status ? status[0].toUpperCase() + status.slice(1) : "All"}
            </Link>
          );
        })}
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Subtotal</th>
              <th className="p-3 text-right">VAT</th>
              <th className="p-3 text-right">Shipping</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {orders?.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-neutral-700">
                  No orders yet.
                </td>
              </tr>
            )}

            {orders?.map((order) => (
              <tr
                key={order.id}
                className="border-t hover:bg-gray-50"
              >
                {/* CLICKABLE ORDER ID */}
                <td className="p-3 font-mono text-xs">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-blue-600 hover:underline font-mono"
                  >
                    {order.order_ref || `${order.id.slice(0, 8)}…`}
                  </Link>
                </td>

                <td className="p-3">
                  <div className="font-medium">
                    {order.customer_name || "—"}
                  </div>
                  <div className="text-neutral-700 text-xs">
                    {order.customer_email}
                  </div>
                </td>

                <td className="p-3">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "dispatched"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "draft"
                        ? "bg-gray-100 text-gray-500"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="p-3 text-right">
                  £{order.subtotal?.toFixed(2) ?? "0.00"}
                </td>

                <td className="p-3 text-right">
                  £{order.vat?.toFixed(2) ?? "0.00"}
                </td>

                <td className="p-3 text-right">
                  £{order.shipping_cost?.toFixed(2) ?? "0.00"}
                </td>

                <td className="p-3 text-right font-semibold">
                  £{order.total?.toFixed(2) ?? "0.00"}
                </td>

                <td className="p-3 text-xs text-neutral-700">
                  {new Date(order.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
