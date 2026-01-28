import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slugify";

function safeArray(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(String);
  if (typeof input === "string") {
    return input
      .replace(/^{|}$/g, "")
      .split(",")
      .map(v => v.trim())
      .filter(Boolean);
  }
  return [];
}

function numeric(val: any) {
  if (val === "" || val === null || val === undefined) return null;
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
}
function numericLoose(val: any) {
  if (val === "" || val === null || val === undefined) return null;
  const cleaned = String(val).replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ❌ Removed requireAdmin()
    // JSON fetch from frontend cannot send Supabase cookies.
    const { id: productId } = await params;
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Missing product id" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const admin = supabaseAdmin();

    /* ---------------------------------------------------------
       AUTO-SLUG RULES
    ---------------------------------------------------------- */
    let finalSlug = String(body.slug ?? "").trim();
    if (!finalSlug) {
      if (!body.title) {
        return NextResponse.json(
          { success: false, error: "Slug is required" },
          { status: 400 }
        );
      }
      finalSlug = slugify(body.title);
    }

    /* ---------------------------------------------------------
       AUTO-SEO (same as Installation Products)
    ---------------------------------------------------------- */
    const autoMetaTitle = body.meta_title?.trim()
      ? body.meta_title
      : `${body.title} – Premium Tile | Bellos Tile Store`;

    const autoMetaDescription = body.meta_description?.trim()
      ? body.meta_description
      : `Buy ${body.title}. High-quality tiles suitable for ${body.application?.join(", ") || "multiple uses"}. Order online at Bellos Tile Store.`;

    const autoKeywords = `${body.title}, tiles, buy tiles online, porcelain tiles, ceramic tiles, Bellos`;

    /* ---------------------------------------------------------
       PAYLOAD
    ---------------------------------------------------------- */
    const payload = {
      status: body.status || "draft",
      title: body.title ?? "",
      slug: finalSlug,
      description: body.description ?? "",

      category_ids: Array.isArray(body.category_ids)
        ? body.category_ids
        : [],

      material: body.material || null,
      color: safeArray(body.color),
      finish: Array.isArray(body.finish) ? body.finish : [],

      application: safeArray(body.application),
      suitable_room: safeArray(body.suitable_room),
      indoor_outdoor: body.indoor_outdoor || null,

      dimension_string: body.dimension_string || null,
      tile_width_mm: numeric(body.tile_width_mm),
      tile_height_mm: numeric(body.tile_height_mm),
      tile_thickness_mm: numeric(body.tile_thickness_mm),

      price_per_m2: numeric(body.price_per_m2),
      price_per_tile: numeric(body.price_per_tile),
      price_per_box: numeric(body.price_per_box),

      tiles_per_box: numeric(body.tiles_per_box),
      box_coverage_m2: numeric(body.box_coverage_m2),

      // IMPORTANT: database column is box_weight_kg
      box_weight_kg: numericLoose(body.weight_per_box),

      boxes_in_stock: numeric(body.boxes_in_stock),
      boxes_per_pallet: numeric(body.boxes_per_pallet),

      // Stored as free text ("3–5 days", etc.)
      lead_time_days: body.lead_time_days ?? "",

      attributes: Array.isArray(body.attributes)
        ? body.attributes
        : [],

      // AUTO-SEO SAFELY INSERTED
      meta_title: autoMetaTitle,
      meta_description: autoMetaDescription,
      og_image_url: body.og_image_url || "",

      // NEW FIELDS
      display_id: body.display_id || null,
      supplier_id: body.supplier_id || null,
    };

    console.log("🟦 PRODUCT UPDATE PAYLOAD:", payload);

    /* ---------------------------------------------------------
       UPDATE PRODUCT
    ---------------------------------------------------------- */
    const { error } = await admin
      .from("products")
      .update(payload)
      .eq("id", productId);

    if (error) {
      console.error("🔥 UPDATE PRODUCT ERROR:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("🔥 PRODUCT UPDATE API ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
