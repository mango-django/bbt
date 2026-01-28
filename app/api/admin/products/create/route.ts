import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, requireAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slugify";

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "Missing product ID" },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();

    /* ----------------------------------------------------
       AUTO-GENERATE SLUG IF EMPTY
    ---------------------------------------------------- */
    let finalSlug = body.slug;

    if (!finalSlug || finalSlug.trim() === "") {
      if (!body.title) {
        return NextResponse.json(
          { success: false, error: "Product must have a title or a slug" },
          { status: 400 }
        );
      }
      finalSlug = slugify(body.title);
    }

    /* ----------------------------------------------------
       NUMERIC HELPER
    ---------------------------------------------------- */
    const numeric = (value: any) => {
      if (value === "" || value === null || value === undefined) return null;
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    };
    const numericLoose = (value: any) => {
      if (value === "" || value === null || value === undefined) return null;
      const cleaned = String(value).replace(/[^0-9.-]/g, "");
      if (!cleaned) return null;
      const num = Number(cleaned);
      return Number.isFinite(num) ? num : null;
    };

    /* ----------------------------------------------------
       UPDATE PRODUCT WITH STRUCTURED FIELDS
    ---------------------------------------------------- */
    const { error } = await admin
      .from("products")
      .update({
        status: body.status ?? "draft",

        /* BASIC INFO */
        title: body.title ?? "",
        slug: finalSlug,
        description: body.description ?? "",

        /* CATEGORIES */
        category_ids: Array.isArray(body.category_ids)
          ? body.category_ids
          : [],

          finish: Array.isArray(body.finish) ? body.finish : [],


        /* STRUCTURED FILTER FIELDS */
        material: body.material || null,

        // arrays
        color: Array.isArray(body.color) ? body.color : [],
        application: Array.isArray(body.application)
          ? body.application
          : [],
        suitable_room: Array.isArray(body.suitable_room)
          ? body.suitable_room
          : [],

        indoor_outdoor: body.indoor_outdoor || null,

        /* DIMENSIONS */
        dimension_string: body.dimension_string || null,
        tile_width_mm: numeric(body.tile_width_mm),
        tile_height_mm: numeric(body.tile_height_mm),
        tile_thickness_mm: numeric(body.tile_thickness_mm),

        /* PRICING */
        price_per_m2: numeric(body.price_per_m2),
        price_per_tile: numeric(body.price_per_tile),
        price_per_box: numeric(body.price_per_box),

        /* PACKAGING */
        tiles_per_box: numeric(body.tiles_per_box),
        box_coverage_m2: numeric(body.box_coverage_m2),
        box_weight_kg: numericLoose(body.weight_per_box),
        boxes_in_stock: numeric(body.boxes_in_stock),
        boxes_per_pallet: numeric(body.boxes_per_pallet),
        lead_time_days: numeric(body.lead_time_days),

        /* SEO */
        meta_title: body.meta_title || null,
        meta_description: body.meta_description || null,
        og_image_url: body.og_image_url || null,
      })
      .eq("id", body.id);

    if (error) {
      console.error("CREATE PRODUCT ERROR:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("API ERROR:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
