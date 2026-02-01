import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

 

/* ---------------------------------------------------------
   STRIPE CLIENT
--------------------------------------------------------- */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

function generateOrderRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "BL-";
  for (let i = 0; i < 10; i += 1) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}



/* ---------------------------------------------------------
   POST /api/checkout/create-session
--------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    /* -------------------------------
       ENV VALIDATION
    -------------------------------- */
    const SITE_URL =
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get("origin") ||
      req.headers.get("referer")?.replace(/\/checkout.*$/, "");

    if (!SITE_URL || !SITE_URL.startsWith("http")) {
      throw new Error("Not a valid URL");
    }

    /* -------------------------------
       REQUEST BODY
    -------------------------------- */
    const body = await req.json();
    const { customer, cart, shippingCost } = body;

    if (!customer?.user_id) {
      return NextResponse.json(
        { error: "User must be logged in to checkout" },
        { status: 401 }
      );
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (typeof shippingCost !== "number") {
      return NextResponse.json(
        { error: "Shipping must be calculated before checkout" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    /* -------------------------------
       CALCULATE TOTALS
    -------------------------------- */
    const subtotal = cart.reduce((sum: number, item: any) => {
  switch (item.productType) {
    case "tile":
      return sum + (item.price_per_m2 ?? 0) * (item.m2 ?? 0);

    case "wood_plank":
      return sum + (item.price_per_box ?? 0) * (item.boxes ?? 0);

    case "installation":
      return sum + (item.price_each ?? 0) * (item.quantity ?? 1);

    default:
      return sum;
  }
}, 0);


    const vat = subtotal * 0.2;
    const total = subtotal + vat + shippingCost;

    const shippingWeight = cart.reduce((sum: number, item: any) => {
      if (item.productType === "installation") {
        return sum + (Number(item.boxWeight) || 0) * (Number(item.quantity) || 1);
      }
      const boxes = Math.ceil((Number(item.m2) || 0) / (Number(item.coverage) || 1));
      return sum + boxes * (Number(item.boxWeight) || 0);
    }, 0);

    /* -------------------------------
       CREATE ORDER (ONCE)
    -------------------------------- */
    const orderRef = generateOrderRef();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: customer.user_id,
        order_ref: orderRef,
        status: "processing",
        payment_status: "pending",

        customer_name: customer.fullName,
        customer_email: customer.email,
        customer_phone: customer.phone,

        address_line1: customer.address1,
        address_line2: customer.address2 || "",
        city: customer.city,
        postcode: customer.postcode,

        subtotal,
        vat,
        shipping_cost: shippingCost,
        shipping_weight: shippingWeight,
        total,

        items: cart,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("ORDER CREATE ERROR:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    /* -------------------------------
       STRIPE LINE ITEMS
    -------------------------------- */
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.map(
  (item: any) => {
    let unitAmount = 0;
    let quantity = 1;

    /* --------------------------------
       INSTALLATION PRODUCTS
    -------------------------------- */
    if (item.productType === "installation") {
      unitAmount = Math.round(Number(item.price_each) * 100);
      quantity = Number(item.quantity) || 1;
    }

    /* --------------------------------
       WOOD PLANK PRODUCTS (PER PACK)
    -------------------------------- */
    else if (item.productType === "wood_plank") {
      const packs =
        Number(item.boxes) ||
        Math.ceil(
          (Number(item.m2) || 0) / (Number(item.coverage) || 1)
        );

      const totalPrice =
        Number(item.price_per_box) * packs;

      unitAmount = Math.round(totalPrice * 100);
      quantity = 1; // IMPORTANT: single line item
    }

    /* --------------------------------
       TILE PRODUCTS (PER m²)
    -------------------------------- */
    else {
      unitAmount = Math.round(
        (Number(item.price_per_m2) || 0) *
          (Number(item.m2) || 0) *
          100
      );
      quantity = 1;
    }

    if (!unitAmount || unitAmount <= 0) {
      throw new Error(`Invalid price for item: ${item.title}`);
    }

    return {
      price_data: {
        currency: "gbp",
        product_data: {
          name: item.finish
            ? `${item.title} (${item.finish})`
            : item.title,
          images: item.image ? [item.image] : [],
        },
        unit_amount: unitAmount,
      },
      quantity,
    };
  }
);


    // Delivery
    line_items.push({
      price_data: {
        currency: "gbp",
        product_data: { name: "Delivery" },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });

    // VAT
    line_items.push({
      price_data: {
        currency: "gbp",
        product_data: { name: "VAT (20%)" },
        unit_amount: Math.round(vat * 100),
      },
      quantity: 1,
    });

    /* -------------------------------
       CREATE STRIPE SESSION
    -------------------------------- */
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,

      success_url: `${SITE_URL}/checkout/success?order_id=${order.id}`,

      cancel_url: `${SITE_URL}/checkout`,

      customer_email: customer.email,

     metadata: {
  order_id: order.id,
  user_id: customer.user_id,
  subtotal: subtotal.toFixed(2),
  vat: vat.toFixed(2),
  shipping: shippingCost.toFixed(2),
  total: total.toFixed(2),
  cart: JSON.stringify(cart),
},

    });

    if (!session.url) {
      console.error("Stripe session missing URL:", session.id);
      return NextResponse.json(
        { error: "Stripe failed to generate checkout URL" },
        { status: 500 }
      );
    }

    /* -------------------------------
       RESPONSE
    -------------------------------- */
    return NextResponse.json({
      url: session.url,
    });
  } catch (err: any) {
    console.error("CHECKOUT ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
