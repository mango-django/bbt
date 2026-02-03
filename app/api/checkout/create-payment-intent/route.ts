import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  
});

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

    /* -------------------------------
       CALCULATE TOTALS (SERVER-SIDE)
    -------------------------------- */
    const subtotal = cart.reduce((sum: number, item: any) => {
      if (item.productType === "installation") {
        return sum + (item.price_each || 0) * (item.quantity || 1);
      }
      return sum + (item.price_per_m2 || 0) * (item.m2 || 0);
    }, 0);

    const vat = subtotal * 0.2;
    const total = subtotal + vat + shippingCost;

    /* -------------------------------
       CREATE PAYMENT INTENT
    -------------------------------- */
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // pence
      currency: "gbp",
      metadata: {
        user_id: customer?.user_id || "guest",
        vat: vat.toFixed(2),
        shipping: shippingCost.toFixed(2),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("PAYMENT INTENT ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
