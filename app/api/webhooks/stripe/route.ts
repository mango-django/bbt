import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendAdminOrderEmail } from "@/lib/email/sendAdminOrderEmail";
import { sendOrderConfirmationEmail } from "@/lib/email/sendOrderConfirmationEmail";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

export async function POST(req: Request) {
  const rawBody = Buffer.from(await req.arrayBuffer());
  const signature = req.headers.get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid webhook signature";
    console.error("❌ Webhook signature verification failed:", message);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  const supabase = supabaseAdmin();

  // -------------------------------------------------------------
  // HANDLE PAYMENT INTENT SUCCESS (Elements flow)
  // -------------------------------------------------------------
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const metadata = paymentIntent.metadata || {};
    const orderId = metadata.order_id;

    if (!orderId) {
      console.warn("⚠️ payment_intent.succeeded missing order_id metadata:", paymentIntent.id);
      return NextResponse.json({ received: true });
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_status: "paid",
        stripe_payment_intent: paymentIntent.id,
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("❌ Failed to mark order paid from payment intent:", updateError);
      return new NextResponse("Webhook handler failed", { status: 500 });
    }

    console.log("✅ Order marked paid via payment_intent.succeeded:", orderId);

    // Send notification emails (non-blocking — don't fail the webhook)
    try {
      const { data: paidOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (paidOrder) {
        const items = Array.isArray(paidOrder.items) ? paidOrder.items as { title: string; finish?: string; m2?: number; quantity?: number }[] : [];
        const emailPayload = {
          id: paidOrder.id,
          order_ref: paidOrder.order_ref,
          customer_name: paidOrder.customer_name,
          customer_email: paidOrder.customer_email,
          subtotal: paidOrder.subtotal,
          vat: paidOrder.vat,
          shipping_cost: paidOrder.shipping_cost,
          total: paidOrder.total,
          items,
        };

        await Promise.allSettled([
          sendAdminOrderEmail(emailPayload),
          sendOrderConfirmationEmail(emailPayload),
        ]);
      }
    } catch (emailErr) {
      console.error("⚠️ Email notification error (non-fatal):", emailErr);
    }

    return NextResponse.json({ received: true });
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

        // Send notification emails
        try {
          const { data: paidOrder } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

          if (paidOrder) {
            const items = Array.isArray(paidOrder.items) ? paidOrder.items as { title: string; finish?: string; m2?: number; quantity?: number }[] : [];
            const emailPayload = {
              id: paidOrder.id,
              order_ref: paidOrder.order_ref,
              customer_name: paidOrder.customer_name,
              customer_email: paidOrder.customer_email,
              subtotal: paidOrder.subtotal,
              vat: paidOrder.vat,
              shipping_cost: paidOrder.shipping_cost,
              total: paidOrder.total,
              items,
            };

            await Promise.allSettled([
              sendAdminOrderEmail(emailPayload),
              sendOrderConfirmationEmail(emailPayload),
            ]);
          }
        } catch (emailErr) {
          console.error("⚠️ Email notification error (non-fatal):", emailErr);
        }

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
      const cart: Record<string, unknown>[] = JSON.parse(metadata.cart || "[]");

      /* -----------------------------------------------
         CALCULATE ORDER TOTALS
         ----------------------------------------------- */
      const subtotal = cart.reduce((sum: number, item) => {
        const productType = item.productType as string;
        if (productType === "installation") {
          return sum + (Number(item.price_each) || 0) * (Number(item.quantity) || 1);
        }
        if (productType === "wood_plank") {
          return sum + (Number(item.price_per_box) || 0) * (Number(item.boxes) || 0);
        }
        return sum + (Number(item.price_per_m2) || 0) * (Number(item.m2) || 0);
      }, 0);

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
      const itemsToInsert = cart.map((item) => ({
        order_id: order.id,
        product_id: typeof item.product_id === "string" ? item.product_id : "",
        title: typeof item.title === "string" ? item.title : "Item",
        finish: typeof item.finish === "string" ? item.finish : null,
        m2: Number(item.m2) || 0,
        price_per_m2: Number(item.price_per_m2) || 0,
        quantity: Number(item.quantity) || 1,
        box_weight: Number(item.boxWeight) || 0,
        coverage_m2: Number(item.coverage) || 0,
      }));

      const { error: itemInsertError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemInsertError) {
        console.error("❌ Failed to insert order items:", itemInsertError);
        throw itemInsertError;
      }

      console.log("✅ Order + Items successfully saved:", order.id);

      // Send notification emails
      try {
        const emailPayload = {
          id: order.id,
          order_ref: order.order_ref,
          customer_name: customerName || "",
          customer_email: customerEmail || "",
          subtotal,
          vat,
          shipping_cost: shippingCost,
          total,
          items: itemsToInsert.map((i) => ({
            title: i.title,
            finish: i.finish ?? undefined,
            m2: i.m2,
            quantity: i.quantity,
          })),
        };

        await Promise.allSettled([
          sendAdminOrderEmail(emailPayload),
          sendOrderConfirmationEmail(emailPayload),
        ]);
      } catch (emailErr) {
        console.error("⚠️ Email notification error (non-fatal):", emailErr);
      }

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
