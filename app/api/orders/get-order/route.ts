// app/api/orders/get-order/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  
});

const supabase = supabaseAdmin();

export async function POST(req: Request) {
  try {
    const { session_id, order_id } = await req.json();

    if (!session_id && !order_id) {
      return NextResponse.json({
        success: false,
        error: "Missing session_id or order_id",
      });
    }

    if (order_id) {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", order_id)
        .single();

      if (orderError || !order) {
        return NextResponse.json({
          success: false,
          error: "Order not found",
        });
      }

      return NextResponse.json({
        success: true,
        order,
        items: Array.isArray(order.items) ? order.items : [],
      });
    }

    // Verify Stripe session exists
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("stripe_session_id", session_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({
        success: false,
        error: "Order not found",
      });
    }

    // Fetch items
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    return NextResponse.json({
      success: true,
      order,
      items,
    });

  } catch (err: any) {
    console.error("GET ORDER ERROR:", err);
    return NextResponse.json({
      success: false,
      error: "Server error",
    });
  }
}
