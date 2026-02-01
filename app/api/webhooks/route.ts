import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // ✅ Only handle completed checkouts
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const supabase = supabaseAdmin();

  // 🔒 Idempotency check
  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .single();

  if (existingOrder) {
    console.log("⚠️ Order already exists, skipping insert");
    return NextResponse.json({ received: true });
  }

  const orderId = session.metadata?.order_id;

  // ✅ Update existing order if ID exists
  if (orderId) {
    const { error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        stripe_session_id: session.id,
      })
      .eq("id", orderId);

    if (error) {
      console.error("❌ Failed to update order:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  }

  // ✅ Create new order
  const orderData = {
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent,
    email: session.customer_details?.email ?? null,

    subtotal: session.metadata?.subtotal
      ? Number(session.metadata.subtotal)
      : null,

    vat: session.metadata?.vat
      ? Number(session.metadata.vat)
      : null,

    shipping: session.total_details?.amount_shipping
      ? session.total_details.amount_shipping / 100
      : 0,

    total: session.amount_total! / 100,

    items: session.metadata?.cart
      ? JSON.parse(session.metadata.cart)
      : [],

    status: "paid",
  };

  const { error } = await supabase.from("orders").insert(orderData);

  if (error) {
    console.error("❌ Failed to save order:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  console.log("✅ Order saved:", session.id);

  return NextResponse.json({ received: true });
}
