import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase/admin";

function parsePgArray(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    return value
      .replace(/^{|}$/g, "")
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }
  return [];
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  const admin = supabaseAdmin();
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing product id" },
      { status: 400 }
    );
  }

  const { data: product, error } = await admin
    .from("products")
    .select(`
      *,
      product_images ( id, url:image_url, sort_order )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("GET PRODUCT ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  const normalised = {
    ...product,

    /* SIMPLE TEXT FIELDS */
    material: product.material ?? "",
    indoor_outdoor: product.indoor_outdoor ?? "",

    /* ARRAY FIELDS */
    finish: parsePgArray(product.finish),           // ⬅ NEW
    color: parsePgArray(product.color),
    application: parsePgArray(product.application),
    suitable_room: parsePgArray(product.suitable_room),

    /* DIMENSIONS */
    tile_width_mm: product.tile_width_mm ?? "",
    tile_height_mm: product.tile_height_mm ?? "",
    tile_thickness_mm: product.tile_thickness_mm ?? "",

    /* PRICING */
    price_per_m2: product.price_per_m2 ?? "",
    price_per_tile: product.price_per_tile ?? "",
    price_per_box: product.price_per_box ?? "",

    /* PACKAGING */
    tiles_per_box: product.tiles_per_box ?? "",
    box_coverage_m2: product.box_coverage_m2 ?? "",

    // Correct DB field: box_weight_kg not weight_per_box
    weight_per_box: product.box_weight_kg ?? "",
     // ⬅ FIXED

    boxes_in_stock: product.boxes_in_stock ?? "",
    boxes_per_pallet: product.boxes_per_pallet ?? "",

    /* LEAD TIME — keep string (3–5 or numbers) */
    lead_time_days: product.lead_time_days || "",

    /* ATTRIBUTES */
    attributes: Array.isArray(product.attributes)
      ? product.attributes
      : [],

    /* IMAGES */
   product_images: Array.isArray(product.product_images)
  ? product.product_images.sort(
      (a: { id: string; url: string; sort_order: number }, 
       b: { id: string; url: string; sort_order: number }) =>
        a.sort_order - b.sort_order
    )
  : [],

  };

  return NextResponse.json({ product: normalised });
}
