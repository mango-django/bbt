import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateOrderRef } from "@/lib/utils/orderRef";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

function getStripeSafeImageUrl(image: unknown): string | null {
  if (typeof image !== "string") return null;
  const trimmed = image.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return null;
}

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */
type CheckoutCustomer = {
  user_id: string;
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  postcode: string;
};

type CheckoutCartItem = {
  title: string;
  image?: string;
  finish?: string;
  productType: "tile" | "wood_plank" | "installation";
  price_per_m2?: number;
  m2?: number;
  price_per_box?: number;
  boxes?: number;
  coverage?: number;
  price_each?: number;
  quantity?: number;
  boxWeight?: number;
};

type CheckoutPayload = {
  customer?: CheckoutCustomer;
  cart?: CheckoutCartItem[];
  shippingCost?: number;
};

/* ---------------------------------------------------------
   POST /api/checkout/create-session
--------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    /* -------------------------------
       ENV VALIDATION (FIXED)
    -------------------------------- */
    const origin = req.headers.get("origin");
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || origin || "";

    if (!SITE_URL.startsWith("http")) {
      throw new Error("Missing valid site URL for Stripe redirect");
    }

    /* -------------------------------
       REQUEST BODY
    -------------------------------- */
    const body = (await req.json()) as CheckoutPayload;
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

    /* -------------------------------
       VALIDATE PRICES (NEW – SAFE)
    -------------------------------- */
    for (const item of cart) {
      if (
        (item.productType === "tile" && (!item.price_per_m2 || !item.m2)) ||
        (item.productType === "wood_plank" && !item.price_per_box) ||
        (item.productType === "installation" && !item.price_each)
      ) {
        return NextResponse.json(
          { error: `Invalid pricing for ${item.title}` },
          { status: 400 }
        );
      }
    }

    const supabase = supabaseAdmin();

    /* -------------------------------
       CALCULATE TOTALS
    -------------------------------- */
    const subtotal = cart.reduce((sum, item) => {
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

    const shippingWeight = cart.reduce((sum, item) => {
      if (item.productType === "installation") {
        return sum + (Number(item.boxWeight) || 0) * (Number(item.quantity) || 1);
      }
      const boxes = Math.ceil(
        (Number(item.m2) || 0) / (Number(item.coverage) || 1)
      );
      return sum + boxes * (Number(item.boxWeight) || 0);
    }, 0);

    /* -------------------------------
       CREATE OR REUSE DRAFT ORDER
    -------------------------------- */
    const draftPayload = {
      user_id: customer.user_id,
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
      const orderRef = generateOrderRef();
      const { data, error } = await supabase
        .from("orders")
        .insert({
          ...draftPayload,
          order_ref: orderRef,
        })
        .select("id")
        .single();
      order = data;
      orderError = error;
    }

    if (orderError || !order) {
      console.error("ORDER CREATE ERROR:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    /* -------------------------------
       STRIPE LINE ITEMS (SAFE)
    -------------------------------- */
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.map(
      (item) => {
        let unitAmount = 0;
        let quantity = 1;

        if (item.productType === "installation") {
          unitAmount = Math.round(Number(item.price_each) * 100);
          quantity = Math.max(1, Number(item.quantity) || 1);
        } else if (item.productType === "wood_plank") {
          const packs =
            Number(item.boxes) ||
            Math.ceil(
              (Number(item.m2) || 0) / (Number(item.coverage) || 1)
            );
          unitAmount = Math.round(Number(item.price_per_box) * 100);
          quantity = Math.max(1, packs);
        } else {
          unitAmount = Math.round(
            (Number(item.price_per_m2) || 0) *
              (Number(item.m2) || 0) *
              100
          );
        }

        if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
          throw new Error(`Invalid Stripe amount for item: ${item.title}`);
        }

        const imageUrl = getStripeSafeImageUrl(item.image);

        return {
          price_data: {
            currency: "gbp",
            product_data: {
              name: item.finish
                ? `${item.title} (${item.finish})`
                : item.title,
              ...(imageUrl ? { images: [imageUrl] } : {}),
            },
            unit_amount: unitAmount,
          },
          quantity,
        };
      }
    );

    line_items.push({
      price_data: {
        currency: "gbp",
        product_data: { name: "Delivery" },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });

    line_items.push({
      price_data: {
        currency: "gbp",
        product_data: { name: "VAT (20%)" },
        unit_amount: Math.round(vat * 100),
      },
      quantity: 1,
    });

    /* -------------------------------
       STRIPE SESSION
    -------------------------------- */
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${SITE_URL}/checkout/success?order_id=${order.id}`,
      cancel_url: `${SITE_URL}/checkout?cancelled=true`,
      customer_email: customer.email,
      metadata: {
        order_id: order.id,
        user_id: customer.user_id,
        total: total.toFixed(2),
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("CHECKOUT ROUTE ERROR:", err);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
