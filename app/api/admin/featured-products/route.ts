import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const SETTING_KEY = "homepage_featured_product_ids";

/* -------------------------------------------------------
   GET  /api/admin/featured-products
   Returns the current featured product IDs and their data
------------------------------------------------------- */
export async function GET() {
  try {
    const admin = supabaseAdmin();

    // Read stored IDs
    const { data: setting } = await admin
      .from("site_settings")
      .select("value")
      .eq("key", SETTING_KEY)
      .maybeSingle();

    const ids: string[] = Array.isArray(setting?.value) ? setting.value : [];

    if (ids.length === 0) {
      return NextResponse.json({ ids: [], products: [] });
    }

    // Fetch product details for those IDs
    const { data: products, error } = await admin
      .from("products")
      .select(
        `
        id,
        title,
        slug,
        status,
        price_per_m2,
        price_per_box,
        product_images (
          url:image_url,
          sort_order
        )
      `
      )
      .in("id", ids);

    if (error) throw error;

    // Preserve admin-defined order
    const sorted = ids
      .map((id) => products?.find((p) => p.id === id))
      .filter(Boolean);

    return NextResponse.json({ ids, products: sorted });
  } catch (err: any) {
    console.error("GET /api/admin/featured-products error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to load featured products" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------
   POST /api/admin/featured-products
   Body: { ids: string[] }  — up to 4 product IDs
------------------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: string[] = (body?.ids ?? []).slice(0, 4);

    const admin = supabaseAdmin();

    const { error } = await admin.from("site_settings").upsert(
      {
        key: SETTING_KEY,
        value: ids,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) throw error;

    return NextResponse.json({ success: true, ids });
  } catch (err: any) {
    console.error("POST /api/admin/featured-products error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to save featured products" },
      { status: 500 }
    );
  }
}
