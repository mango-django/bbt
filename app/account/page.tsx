import Link from "next/link";
import LogoutButton from "@/components/account/LogoutButton";
import CopyTrackingButton from "@/components/account/CopyTrackingButton";
import { redirect } from "next/navigation";
import { supabaseServerAuth } from "@/lib/supabase/server-auth";

 

export default async function AccountPage() {
  const supabase = await supabaseServerAuth();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔒 Hard auth guard
  if (!user) {
    redirect("/login?redirect=/account");
  }

  // 🔑 Fetch role from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // 📦 Orders
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_ref, status, total, created_at, tracking_number")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 text-neutral-700">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Account</h1>

        <div className="flex gap-4 text-sm items-center">
          <Link href="/account/profile" className="underline">
            Edit Profile
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="underline font-semibold text-neutral-700"
            >
              Admin Dashboard
            </Link>
          )}

          {/* ✅ Correct logout (client-side, redirects home) */}
          <LogoutButton className="underline" />
        </div>
      </div>

      {/* ORDERS */}
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
            {orders?.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-neutral-700"
                >
                  You haven’t placed any orders yet.
                </td>
              </tr>
            )}

            {orders?.map((order) => (
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
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
