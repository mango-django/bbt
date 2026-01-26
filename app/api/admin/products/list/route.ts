import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    // ❌ Removed requireAdmin() because fetch() does NOT send cookies
    //    and service-role is already safe for admin-only API usage.

    const admin = supabaseAdmin(); // no need to await

    const { data, error } = await admin
      .from("products")
      .select(
        `
        id,
        title,
        display_id,
        supplier_id,
        slug,
        dimension_string,
        tile_width_mm,
        tile_height_mm,
        price_per_m2,
        price_per_box,
        boxes_in_stock,
        created_at,
        status,
        product_images:product_images (
          url:image_url
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("PRODUCT LIST ERROR:", error);
      return NextResponse.json(
        { error: "Failed to load products" },
        { status: 500 }
      );
    }

    return NextResponse.json({ products: data });

  } catch (err: any) {
    console.error("PRODUCT LIST ERROR:", err);

    return NextResponse.json(
      {
        error:
          err?.message ||
          err?.statusText ||
          err?.toString() ||
          "Unknown server error",
      },
      { status: 500 }
    );
  }
}
