import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// CREATE NEW INSTALLATION PRODUCT
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabase = await supabaseAdmin();

    const { data, error } = await supabase
      .from("installation_products")
      .insert({
        name: body.name,
        product_type: body.product_type,
        colour: body.colour,
        unit_type: body.unit_type,
        unit_amount: body.unit_amount,
        description: body.description,
        price: Number(body.price),
        stock_qty: Number(body.stock_qty),
        status: body.status ?? "active",
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error("CREATE INSTALLATION PRODUCT ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// GET ALL INSTALLATION PRODUCTS
export async function GET() {
  const supabase = await supabaseAdmin();

  const { data, error } = await supabase
    .from("installation_products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, products: data });
}
