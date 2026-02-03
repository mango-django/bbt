import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

export async function POST(req: Request) {
  try {
    const { paymentIntentId, orderId } = (await req.json()) as {
      paymentIntentId?: string;
      orderId?: string;
    };

    if (!paymentIntentId || !orderId) {
      return NextResponse.json(
        { error: "Missing paymentIntentId or orderId" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment has not succeeded" },
        { status: 400 }
      );
    }

    if (paymentIntent.metadata?.order_id && paymentIntent.metadata.order_id !== orderId) {
      return NextResponse.json(
        { error: "Payment intent does not match order" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();
    const { error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_status: "paid",
        stripe_payment_intent: paymentIntent.id,
      })
      .eq("id", orderId);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update order" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CONFIRM PAYMENT INTENT ERROR:", err);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
