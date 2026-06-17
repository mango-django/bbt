import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendAdminOrderEmail } from "./sendAdminOrderEmail";
import { sendOrderConfirmationEmail } from "./sendOrderConfirmationEmail";

type StripeRefs = {
  paymentIntentId?: string;
  sessionId?: string;
};

type OrderItem = {
  title: string;
  finish?: string;
  m2?: number;
  quantity?: number;
};

/**
 * Atomically marks an order as paid and sends the admin + customer emails
 * EXACTLY ONCE, no matter how many times it is called.
 *
 * Both the Stripe webhook (`payment_intent.succeeded` /
 * `checkout.session.completed`) and the synchronous client confirmation
 * (`/api/checkout/confirm-payment-intent`) call this. Whichever fires first
 * "claims" the order by flipping `payment_status` from non-paid → paid; the
 * loser sees no rows updated and skips the emails. This gives us reliable
 * notifications even if one of the two paths fails, with no duplicates.
 */
export async function markOrderPaidAndNotify(
  orderId: string,
  refs: StripeRefs = {}
): Promise<{ sent: boolean; reason?: string }> {
  const supabase = supabaseAdmin();

  // --- Atomic claim: only the caller that transitions unpaid → paid wins ---
  const { data: claimedRows, error: claimError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_status: "paid",
      ...(refs.paymentIntentId
        ? { stripe_payment_intent: refs.paymentIntentId }
        : {}),
      ...(refs.sessionId ? { stripe_session_id: refs.sessionId } : {}),
    })
    .eq("id", orderId)
    .neq("payment_status", "paid")
    .select("*");

  if (claimError) {
    console.error("❌ Failed to mark order paid:", claimError);
    throw claimError;
  }

  if (!claimedRows || claimedRows.length === 0) {
    // Already paid + notified by the other path, or the order doesn't exist.
    console.log(
      "ℹ️ Order already marked paid (skipping duplicate emails):",
      orderId
    );
    return { sent: false, reason: "already_paid_or_missing" };
  }

  const order = claimedRows[0];
  console.log("✅ Order marked paid:", orderId, order.order_ref);

  const items: OrderItem[] = Array.isArray(order.items)
    ? (order.items as OrderItem[])
    : [];

  const payload = {
    id: order.id,
    order_ref: order.order_ref,
    customer_name: order.customer_name ?? "",
    customer_email: order.customer_email ?? "",
    subtotal: Number(order.subtotal) || 0,
    vat: Number(order.vat) || 0,
    shipping_cost: Number(order.shipping_cost) || 0,
    total: Number(order.total) || 0,
    items,
  };

  const results = await Promise.allSettled([
    sendAdminOrderEmail(payload),
    sendOrderConfirmationEmail(payload),
  ]);

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const which = i === 0 ? "admin" : "customer";
      console.error(
        `⚠️ Order ${order.order_ref}: ${which} email FAILED —`,
        r.reason
      );
    }
  });

  return { sent: true };
}
