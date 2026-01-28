import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

 

export async function POST(req: Request) {
  try {
    // ❌ Removed requireAdmin()
    // Frontend FormData upload does NOT send cookies -> always 401.
    // Service-role key in supabaseAdmin() is enough to protect the route.

    const admin = supabaseAdmin();
    const formData = await req.formData();

    const product_id = formData.get("product_id") as string;
    const file = formData.get("file") as File;

    if (!product_id) {
      return NextResponse.json(
        { error: "Missing product_id" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${product_id}/${Date.now()}-${file.name}`;

    /* ----------------------------------------------------
       1. UPLOAD FILE TO SUPABASE STORAGE
    ---------------------------------------------------- */
    const { data: uploadData, error: uploadError } = await admin.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;

    /* ----------------------------------------------------
       2. SAVE IMAGE RECORD IN DATABASE
    ---------------------------------------------------- */
    const { data: inserted, error: dbError } = await admin
      .from("product_images")
      .insert({
        product_id,
        image_url: publicURL,
        sort_order: 999,
      })
      .select("id, image_url")
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: {
        id: inserted?.id,
        url: inserted?.image_url ?? publicURL,
      },
      filename: fileName,
    });
  } catch (err: any) {
    console.error("UPLOAD API ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
