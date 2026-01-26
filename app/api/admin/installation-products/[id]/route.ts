import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET SINGLE PRODUCT
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id || id === "undefined") {
    return NextResponse.json(
      { success: false, error: "Invalid product ID" },
      { status: 400 }
    );
  }

  const supabase = await supabaseAdmin();

  const { data, error } = await supabase
    .from("installation_products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, product: data });
}

// UPDATE PRODUCT
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id || id === "undefined") {
    return NextResponse.json(
      { success: false, error: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const supabase = await supabaseAdmin();

    const { data, error } = await supabase
      .from("installation_products")
      .update({
        name: body.name,
        product_type: body.product_type,
        colour: body.colour,
        unit_type: body.unit_type,
        unit_amount: body.unit_amount,
        description: body.description,
        price: Number(body.price),
        stock_qty: Number(body.stock_qty),
        status: body.status,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error("UPDATE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// DELETE PRODUCT
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  console.log("API DELETE RECEIVED ID:", id);

  if (!id || id === "undefined") {
    return NextResponse.json(
      { success: false, error: "Invalid product ID" },
      { status: 400 }
    );
  }

  try {
    const supabase = await supabaseAdmin();

    const { error } = await supabase
      .from("installation_products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
