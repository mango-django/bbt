import { NextResponse } from "next/server";
import { supabaseAdmin, requireAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

export async function POST() {
  try {
    // Require admin
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }
    const admin = supabaseAdmin();

    // Generate unique ID + slug
    const id = randomUUID();
    const slug = `product-${id}`;

    // Create full draft record
    const { data, error } = await admin
      .from("products")
      .insert([
        {
          id,
          status: "draft",

          // Required empty defaults
          title: "",
          slug,

          description: "",
          material: null,
          finish: null,
          indoor_outdoor: null,

          color: [],                // ⭐ Correct field (not colour)
          application: [],
          suitable_room: [],
          category_ids: [],

          // Dimensions
          dimension_string: null,
          tile_width_mm: null,
          tile_height_mm: null,
          tile_thickness_mm: null,

          // Pricing
          price_per_m2: null,
          price_per_tile: null,
          price_per_box: null,

          // Stock
          tiles_per_box: null,
          box_coverage_m2: null,
          box_weight_kg: null,
          boxes_in_stock: null,
          boxes_per_pallet: null,
          lead_time_days: null,

          // SEO
          meta_title: "",
          meta_description: "",
          og_image_url: "",

          // NEW FIELDS
          display_id: "",          // ⭐ front end visible ID
          supplier_id: "",         // ⭐ backend ordering ID

          attributes: [],
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("PRODUCT CREATE ERROR:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product_id: data.id,
    });

  } catch (err: any) {
    console.error("CREATE PRODUCT DRAFT ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
