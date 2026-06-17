import { NextResponse } from "next/server";
import Stripe from "stripe";
import { markOrderPaidAndNotify } from "@/lib/email/notifyOrderPaid";

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

    // Mark paid + send emails exactly once (the webhook may also call this).
    await markOrderPaidAndNotify(orderId, { paymentIntentId: paymentIntent.id });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CONFIRM PAYMENT INTENT ERROR:", err);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
