import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin"; // ADMIN SUPABASE (service role key)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  
});

const supabase = supabaseAdmin();

export async function POST(req: Request) {
  const rawBody = Buffer.from(await req.arrayBuffer());
  const signature = req.headers.get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // -------------------------------------------------------------
  // HANDLE SUCCESSFUL PAYMENT EVENT
  // -------------------------------------------------------------
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const metadata = session.metadata || {};
      const orderId = metadata.order_id;

      if (orderId) {
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "paid",
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string,
            payment_status: "paid",
          })
          .eq("id", orderId);

        if (updateError) {
          console.error("❌ Failed to update order:", updateError);
          throw updateError;
        }

        console.log("✅ Order marked paid:", orderId);
        return NextResponse.json({ received: true });
      }

      /* -----------------------------------------------
         EXTRACT METADATA
         ----------------------------------------------- */
      const customerName = metadata.fullName;
      const customerEmail = metadata.email;
      const customerPhone = metadata.phone;

      const address1 = metadata.address1;
      const address2 = metadata.address2 || "";
      const city = metadata.city;
      const postcode = metadata.postcode;

      const shippingCost = Number(metadata.shippingCost || 0);

      // Cart from metadata
      const cart = JSON.parse(metadata.cart || "[]");

      /* -----------------------------------------------
         CALCULATE ORDER TOTALS
         ----------------------------------------------- */
      const subtotal = cart.reduce(
        (sum: number, item: any) => sum + item.price_per_m2 * item.m2,
        0
      );

      const vat = subtotal * 0.2;
      const total = subtotal + vat + shippingCost;

      /* -----------------------------------------------
         CREATE ORDER IN SUPABASE
         ----------------------------------------------- */
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          stripe_session_id: session.id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,

          address_line1: address1,
          address_line2: address2,
          city,
          postcode,

          subtotal,
          vat,
          shipping_cost: shippingCost,
          total,

          status: "paid",
        })
        .select()
        .single();

      if (orderError) {
        console.error("❌ Failed to create order:", orderError);
        throw orderError;
      }

      /* -----------------------------------------------
         INSERT ORDER ITEMS
         ----------------------------------------------- */
      const itemsToInsert = cart.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        title: item.title,
        finish: item.finish || null,
        m2: item.m2,
        price_per_m2: item.price_per_m2,
        quantity: item.quantity,
        box_weight: item.boxWeight,
        coverage_m2: item.coverage,
      }));

      const { error: itemInsertError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemInsertError) {
        console.error("❌ Failed to insert order items:", itemInsertError);
        throw itemInsertError;
      }

      console.log("✅ Order + Items successfully saved:", order.id);

      return NextResponse.json({ received: true });
    } catch (err) {
      console.error("❌ Webhook internal error:", err);
      return new NextResponse("Webhook handler failed", { status: 500 });
    }
  }

  // -------------------------------------------------------------
  // UNKNOWN EVENT TYPE
  // -------------------------------------------------------------
  return NextResponse.json({ status: "ignored" });
}
