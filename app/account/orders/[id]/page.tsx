import { redirect } from "next/navigation";
import { supabaseServerAuth } from "@/lib/supabase/server-auth";

 

export default async function CustomerOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServerAuth();

  /* ---------------- AUTH ---------------- */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  /* ---------------- LOAD ORDER ---------------- */
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Order not found</h1>
        <p className="text-gray-600 mt-2">
          This order does not exist or does not belong to you.
        </p>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];

  /* ---------------- RENDER ---------------- */
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Order {order.id.slice(0, 8)}…
        </h1>

        <StatusBadge status={order.status} />
      </div>

      {/* SUMMARY */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white shadow rounded p-6">
        <Summary label="Subtotal" value={order.subtotal} />
        <Summary label="VAT" value={order.vat} />
        <Summary label="Delivery" value={order.shipping_cost} />
        <Summary label="Total" value={order.total} bold />
      </section>

      {/* DELIVERY */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="font-semibold mb-2">Delivery Address</h2>
        <p className="text-sm text-gray-700">
          {order.customer_name}
          <br />
          {order.address_line1}
          {order.address_line2 && <>, {order.address_line2}</>}
          <br />
          {order.city}
          <br />
          {order.postcode}
        </p>
        {order.tracking_number && (
          <p className="mt-2">
            <strong>Tracking Number:</strong> {order.tracking_number}
          </p>
        )}
      </section>

      {/* ITEMS */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="font-semibold mb-4">Items</h2>

        <div className="space-y-4">
          {items.map((item: any, idx: number) => {
            const lineTotal =
              item.productType === "installation"
                ? (item.price_each ?? 0) * (item.quantity ?? 1)
                : (item.price_per_m2 ?? 0) * (item.m2 ?? 0);

            return (
              <div
                key={idx}
                className="flex gap-4 border-b pb-4 last:border-0"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}

                <div className="flex-1">
                  <div className="font-medium">
                    {item.title}
                    {item.finish && ` (${item.finish})`}
                  </div>

                  <div className="text-sm text-gray-500">
                    {item.productType === "installation"
                      ? `${item.quantity} × £${item.price_each}`
                      : `${item.m2} m² × £${item.price_per_m2}/m²`}
                  </div>
                </div>

                <div className="font-semibold">
                  £{lineTotal.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

function Summary({
  label,
  value,
  bold,
}: {
  label: string;
  value?: number;
  bold?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={bold ? "text-lg font-bold" : "font-medium"}>
        £{(value ?? 0).toFixed(2)}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "Processing",
    paid: "Processing",
    dispatched: "Dispatched",
    delivered: "Delivered",
  };

  const label = map[status] || status;

  return (
    <span className="px-3 py-1 rounded text-sm bg-gray-100">
      {label}
    </span>
  );
}
