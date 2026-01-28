import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

export async function POST() {
  try {
    const supabase = await supabaseAdmin();
    const id = randomUUID();

    const { data, error } = await supabase
      .from("installation_products")
      .insert({
        id,
        name: "",
        slug: `product-${id}`,
        product_type: "adhesive",
        colour: "N/A",
        unit_type: "kg",
        unit_amount: "",
        description: "",
        price: 0,
        stock_qty: 0,
        status: "draft",

        // SEO defaults
        seo_title: "",
        seo_description: "",
        seo_keywords: "",

        // ⭐ NEW IDENTIFIERS
        display_id: "",
        supplier_id: "",
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error("CREATE DRAFT ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
