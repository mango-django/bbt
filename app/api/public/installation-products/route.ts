import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = supabaseServer();

  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type");
  const color = searchParams.get("color");
  const size = searchParams.get("size");

  let query = supabase
    .from("installation_products")
    .select("*, installation_product_images(url)")
    .ilike("status", "active");

  if (type) query = query.eq("product_type", type);
  if (color) query = query.eq("colour", color);
  if (size) query = query.eq("unit_amount", size);

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("[INSTALLATION PRODUCTS API ERROR]", error);
    return NextResponse.json({ products: [] });
  }

  return NextResponse.json({ products: data });
}
