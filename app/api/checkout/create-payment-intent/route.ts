import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateOrderRef } from "@/lib/utils/orderRef";
import { resolveCartShipping } from "@/lib/shipping-server";
import { tileLinePrice } from "@/lib/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

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

    // Guest checkout is allowed: user_id is optional. Require the basics needed
    // to fulfil and contact the customer about the order.
    if (!customer?.email || !customer?.fullName) {
      return NextResponse.json(
        { error: "Name and email are required to checkout" },
        { status: 400 }
      );
    }

    const userId: string | null = customer.user_id ?? null;

    const supabase = supabaseAdmin();

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
      // Tiles: whole boxes — must match the cart display and the calculator
      return sum + tileLinePrice(item);
    }, 0);

    const vat = subtotal * 0.2;

    // Delivery is recomputed here from product weights in the database — the
    // client-supplied figure is display-only. If ours is higher, bounce the
    // request so the customer sees the correct price before paying.
    const shipping = await resolveCartShipping(supabase, cart);
    if (shipping.cost > shippingCost + 0.01) {
      return NextResponse.json(
        {
          error:
            "Delivery cost has been updated — please return to your basket and recalculate delivery before checking out.",
          shippingCost: shipping.cost,
        },
        { status: 409 }
      );
    }

    const shippingWeight = shipping.weight;
    const total = subtotal + vat + shipping.cost;

    /* -------------------------------
       CREATE OR REUSE DRAFT ORDER
    -------------------------------- */
    const draftPayload = {
      user_id: userId,
      customer_name: customer.fullName || "",
      customer_email: customer.email || "",
      customer_phone: customer.phone || "",
      address_line1: customer.address1 || "",
      address_line2: customer.address2 || "",
      city: customer.city || "",
      postcode: customer.postcode || "",
      subtotal,
      vat,
      shipping_cost: shipping.cost,
      shipping_weight: shippingWeight,
      total,
      items: cart,
      status: "draft",
      payment_status: "unpaid",
    };

    // Only reuse an existing draft for signed-in users; guests always get a
    // fresh order (there is no stable identifier to match a guest's draft).
    const { data: existingDraft } = userId
      ? await supabase
          .from("orders")
          .select("id")
          .eq("user_id", userId)
          .eq("status", "draft")
          .eq("payment_status", "unpaid")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null };

    let order: { id: string } | null = null;
    let orderError: { message: string } | null = null;

    if (existingDraft?.id) {
      const { data, error } = await supabase
        .from("orders")
        .update(draftPayload)
        .eq("id", existingDraft.id)
        .eq("user_id", userId)
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
        user_id: userId || "guest",
        vat: vat.toFixed(2),
        shipping: shipping.cost.toFixed(2),
      },
    });

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        stripe_payment_intent: paymentIntent.id,
      })
      .eq("id", order.id);

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
