import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  
});

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  const body = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Stripe event types we care about
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const orderId = session.metadata?.order_id;

    if (orderId) {
      const supabase = supabaseAdmin();
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          stripe_session_id: session.id,
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("❌ Failed to update order:", updateError);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      return NextResponse.json({ received: true });
    }

    const orderData = {
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent,
      email: session.customer_details?.email ?? null,

      subtotal: session.metadata?.subtotal
        ? Number(session.metadata.subtotal)
        : null,

      vat: session.metadata?.vat ? Number(session.metadata.vat) : null,

      shipping: session.total_details?.amount_shipping
        ? session.total_details.amount_shipping / 100
        : 0,

      total: session.amount_total / 100,

      items: session.metadata?.cart
        ? JSON.parse(session.metadata.cart)
        : [],

      status: "paid",
    };

    const supabase = supabaseAdmin();

    const { error } = await supabase.from("orders").insert(orderData);

    if (error) {
      console.error("❌ Failed to save order:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    console.log("✅ Order saved to Supabase:", orderData);
  }

  return NextResponse.json({ received: true });
}
