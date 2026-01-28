import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const productId = form.get("product_id") as string | null;

    if (!file || !productId) {
      return NextResponse.json(
        { success: false, error: "Missing file or product_id" },
        { status: 400 }
      );
    }

    const supabase = await supabaseAdmin();

    // Determine next sort order
    const { count } = await supabase
      .from("installation_product_images")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId);

    const nextSortOrder = count ?? 0;

    // Generate file path
    const ext = file.name.split(".").pop();
    const filePath = `${productId}/${randomUUID()}.${ext ?? "jpg"}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("installation-products")
      .upload(filePath, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Storage upload failed:", uploadError);
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    // Create public URL
    const { data: urlData } = supabase.storage
      .from("installation-products")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Insert DB record
    const { data, error } = await supabase
      .from("installation_product_images")
      .insert({
        product_id: productId,
        file_path: filePath,
        url: publicUrl,
        sort_order: nextSortOrder,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Failed to insert image row:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Return API-ready image object
    return NextResponse.json({
      success: true,
      image: {
        id: data.id,
        url: data.url,
        file_path: data.file_path,
        sort_order: data.sort_order,
      },
    });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
