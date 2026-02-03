import Link from "next/link";
import LogoutButton from "@/components/account/LogoutButton";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServerAuth } from "@/lib/supabase/server-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import AccountOrdersTable from "@/components/account/AccountOrdersTable";

export default async function AccountPage() {
  async function deleteDraftOrder(orderId: string) {
    "use server";

    if (!orderId) {
      throw new Error("Missing order ID.");
    }

    const supabase = await supabaseServerAuth();
    const admin = supabaseAdmin();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized.");
    }

    // Safety check: must be user's draft order.
    const { data: existingOrder, error: fetchError } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingOrder) {
      throw new Error(fetchError?.message || "Draft order not found.");
    }

    if (String(existingOrder.status).toLowerCase() !== "draft") {
      throw new Error("Only draft orders can be deleted.");
    }

    // Delete child items first (FK safety).
    const { error: itemsDeleteError } = await admin
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (
      itemsDeleteError &&
      !itemsDeleteError.message.toLowerCase().includes("relation")
    ) {
      throw new Error(itemsDeleteError.message);
    }

    // Delete draft order and verify it was removed.
    const { data: deletedOrder, error: orderDeleteError } = await admin
      .from("orders")
      .delete()
      .eq("id", orderId)
      .eq("user_id", user.id)
      .eq("status", "draft")
      .select("id")
      .maybeSingle();

    if (orderDeleteError) {
      throw new Error(orderDeleteError.message);
    }
    if (!deletedOrder) {
      throw new Error("Draft order was not deleted.");
    }

    revalidatePath("/account", "page");
    revalidatePath(`/account/orders/${orderId}`, "page");
  }


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

      <AccountOrdersTable initialOrders={orders ?? []} deleteAction={deleteDraftOrder} />
    </div>
  );
}
