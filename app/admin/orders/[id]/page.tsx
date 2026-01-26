import { supabaseAdmin, requireAdmin } from "@/lib/supabase/admin";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";

export const runtime = "nodejs";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return (
      <div className="p-6 text-red-600">
        {auth.error}
      </div>
    );
  }

  const { id } = await params;
  const supabase = await supabaseAdmin();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !order) {
    if (error) {
      console.error("ORDER LOAD ERROR:", error.message);
    }

    return (
      <div className="p-6 text-red-600">
        Order not found.
      </div>
    );
  }

  const cart = order.items || order.cart || [];

  return (
    <div className="p-6 space-y-8 max-w-6xl">
      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Order {order.order_ref || order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-500">
            Placed {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded text-sm font-medium ${
            order.status === "delivered"
              ? "bg-green-100 text-green-700"
              : order.status === "dispatched"
              ? "bg-blue-100 text-blue-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* ORDER SUMMARY */}
      <section className="bg-white shadow rounded p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Summary label="Subtotal" value={`£${order.subtotal?.toFixed(2)}`} />
        <Summary label="VAT" value={`£${order.vat?.toFixed(2)}`} />
        <Summary
          label="Shipping"
          value={`£${order.shipping_cost?.toFixed(2)}`}
        />
        <Summary
          label="Total"
          value={`£${order.total?.toFixed(2)}`}
          bold
        />
      </section>

      <OrderStatusUpdater
        orderId={order.id}
        status={
          ["processing", "dispatched", "delivered"].includes(order.status)
            ? order.status
            : "processing"
        }
        trackingNumber={order.tracking_number}
      />

      {/* CUSTOMER & ADDRESS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Customer Details">
          <Field label="Name" value={order.customer_name} />
          <Field label="Email" value={order.customer_email} />
          <Field label="Phone" value={order.customer_phone} />
        </Card>

        <Card title="Delivery Address">
          <Field label="Address 1" value={order.address_line1} />
          <Field label="Address 2" value={order.address_line2} />
          <Field label="City" value={order.city} />
          <Field label="Postcode" value={order.postcode} />
        </Card>
      </section>

      {/* PRODUCTS */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">Products</h2>

        <div className="space-y-4">
          {cart.map((item: any, idx: number) => {
            const lineTotal =
              item.productType === "tile"
                ? item.price_per_m2 * item.m2
                : item.price_each * item.quantity;

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
                    Type: {item.productType}
                  </div>

                  <div className="text-sm">
                    {item.productType === "tile" ? (
                      <>
                        {item.m2} m² × £{item.price_per_m2}/m²
                      </>
                    ) : (
                      <>
                        {item.quantity} × £{item.price_each}
                      </>
                    )}
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

/* ---------------------------------------------------------
   SMALL COMPONENTS
--------------------------------------------------------- */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white shadow rounded p-6 space-y-2">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="text-sm">
      <span className="text-gray-500">{label}:</span>{" "}
      <span>{value || "—"}</span>
    </div>
  );
}

function Summary({
  label,
  value,
  bold,
}: {
  label: string;
  value?: string;
  bold?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={bold ? "text-lg font-bold" : "font-medium"}>
        {value}
      </div>
    </div>
  );
}
