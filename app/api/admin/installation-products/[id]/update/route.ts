import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slugify";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const body = await req.json();
    const supabase = await supabaseAdmin();

    // -------------------------------------------
    // VALIDATION (SERVER-SIDE)
    // -------------------------------------------

    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Product name is required." },
        { status: 400 }
      );
    }

    if (!body.price || Number(body.price) <= 0) {
      return NextResponse.json(
        { success: false, error: "Price must be greater than 0." },
        { status: 400 }
      );
    }

    if (!body.unit_amount || body.unit_amount.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Unit amount is required." },
        { status: 400 }
      );
    }

    // If product is being set to ACTIVE, ensure images exist
    if (body.status === "active") {
      const { data: imgs } = await supabase
        .from("installation_product_images")
        .select("id")
        .eq("product_id", id);

      if (!imgs || imgs.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Active products must have at least one image uploaded before publishing.",
          },
          { status: 400 }
        );
      }
    }

    // Prevent images from being overwritten by this endpoint.
    delete body.images;

    // Ensure slug exists
    let finalSlug = (body.slug ?? "").trim();
    if (!finalSlug) {
      finalSlug = slugify(body.name);
    }

    // -------------------------------------------
    // UPDATE PRODUCT
    // -------------------------------------------
    const { error } = await supabase
      .from("installation_products")
      .update({
        name: body.name,
        slug: finalSlug,
        product_type: body.product_type,
        colour: body.colour,
        unit_type: body.unit_type,
        unit_amount: body.unit_amount,
        description: body.description,
        price: Number(body.price),
        stock_qty: Number(body.stock_qty),

        // SEO FIELDS
        seo_title: body.seo_title,
        seo_description: body.seo_description,
        seo_keywords: body.seo_keywords,

        // Status
        status: body.status,

        // ⭐ NEW IDENTIFIERS
        display_id: body.display_id || null,
        supplier_id: body.supplier_id || null,
      })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("UPDATE INSTALLATION PRODUCT ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
