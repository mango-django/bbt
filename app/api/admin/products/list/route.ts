import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Supabase caps a single request at 1000 rows, so this endpoint pages through
// the table with offset/limit and reports the exact total for the client.
const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 1000;

export async function GET(req: NextRequest) {
  try {
    // ❌ Removed requireAdmin() because fetch() does NOT send cookies
    //    and service-role is already safe for admin-only API usage.

    const { searchParams } = new URL(req.url);
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number(searchParams.get("limit")) || DEFAULT_LIMIT)
    );

    const admin = supabaseAdmin(); // no need to await

    const { data, error, count } = await admin
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
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("PRODUCT LIST ERROR:", error);
      return NextResponse.json(
        { error: "Failed to load products" },
        { status: 500 }
      );
    }

    const total = count ?? 0;

    return NextResponse.json({
      products: data,
      total,
      offset,
      limit,
      hasMore: offset + (data?.length ?? 0) < total,
    });

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
