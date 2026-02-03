import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  
});

function generateOrderRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "BL-";
  for (let i = 0; i < 10; i += 1) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

export async function POST(req: Request) {
  try {
    const { cart, shippingCost, customer } = await req.json();

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (typeof shippingCost !== "number") {
      return NextResponse.json(
        { error: "Invalid shipping cost" },
        { status: 400 }
      );
    }
    if (!customer?.user_id) {
      return NextResponse.json(
        { error: "User must be logged in to checkout" },
        { status: 401 }
      );
    }

    /* -------------------------------
       CALCULATE TOTALS (SERVER-SIDE)
    -------------------------------- */
    const subtotal = cart.reduce((sum: number, item: Record<string, unknown>) => {
      if (item.productType === "installation") {
        return sum + (Number(item.price_each) || 0) * (Number(item.quantity) || 1);
      }
      if (item.productType === "wood_plank") {
        return sum + (Number(item.price_per_box) || 0) * (Number(item.boxes) || 0);
      }
      return sum + (Number(item.price_per_m2) || 0) * (Number(item.m2) || 0);
    }, 0);

    const vat = subtotal * 0.2;
    const total = subtotal + vat + shippingCost;

    const shippingWeight = cart.reduce((sum: number, item: Record<string, unknown>) => {
      if (item.productType === "installation") {
        return sum + (Number(item.boxWeight) || 0) * (Number(item.quantity) || 1);
      }
      if (item.productType === "wood_plank") {
        return sum + (Number(item.boxes) || 0) * (Number(item.boxWeight) || 0);
      }
      const boxes = Math.ceil((Number(item.m2) || 0) / (Number(item.coverage) || 1));
      return sum + boxes * (Number(item.boxWeight) || 0);
    }, 0);

    const supabase = supabaseAdmin();

    /* -------------------------------
       CREATE OR REUSE DRAFT ORDER
    -------------------------------- */
    const draftPayload = {
      user_id: customer.user_id as string,
      customer_name: customer.fullName || "",
      customer_email: customer.email || "",
      customer_phone: customer.phone || "",
      address_line1: customer.address1 || "",
      address_line2: customer.address2 || "",
      city: customer.city || "",
      postcode: customer.postcode || "",
      subtotal,
      vat,
      shipping_cost: shippingCost,
      shipping_weight: shippingWeight,
      total,
      items: cart,
      status: "draft",
      payment_status: "unpaid",
    };

    const { data: existingDraft } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", customer.user_id)
      .eq("status", "draft")
      .eq("payment_status", "unpaid")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let order: { id: string } | null = null;
    let orderError: { message: string } | null = null;

    if (existingDraft?.id) {
      const { data, error } = await supabase
        .from("orders")
        .update(draftPayload)
        .eq("id", existingDraft.id)
        .eq("user_id", customer.user_id)
        .select("id")
        .single();
      order = data;
      orderError = error;
    } else {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          ...draftPayload,
          order_ref: generateOrderRef(),
        })
        .select("id")
        .single();
      order = data;
      orderError = error;
    }

    if (orderError || !order) {
      console.error("CREATE/UPDATE DRAFT ERROR:", orderError);
      return NextResponse.json(
        { error: "Failed to create draft order" },
        { status: 500 }
      );
    }

    /* -------------------------------
       CREATE PAYMENT INTENT
    -------------------------------- */
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // pence
      currency: "gbp",
      receipt_email: customer.email || undefined,
      metadata: {
        order_id: order.id,
        user_id: customer?.user_id || "guest",
        vat: vat.toFixed(2),
        shipping: shippingCost.toFixed(2),
      },
    });

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        stripe_payment_intent: paymentIntent.id,
      })
      .eq("id", order.id)
      .eq("user_id", customer.user_id);

    if (orderUpdateError) {
      console.error("ORDER PAYMENT INTENT LINK ERROR:", orderUpdateError);
      return NextResponse.json(
        { error: "Failed to link payment to order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });
  } catch (err) {
    console.error("PAYMENT INTENT ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
