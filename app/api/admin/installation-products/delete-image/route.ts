import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { id, file_path } = await req.json();

    if (!id || !file_path) {
      return NextResponse.json(
        { success: false, error: "Missing id or file_path" },
        { status: 400 }
      );
    }

    const supabase = await supabaseAdmin();

    // 1. Get the image BEFORE deletion (needed to know product_id)
    const { data: targetImage, error: findError } = await supabase
      .from("installation_product_images")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !targetImage) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    const productId = targetImage.product_id;

    // 2. Delete file from storage
    const { error: storageError } = await supabase.storage
      .from("installation-products")
      .remove([file_path]);

    if (storageError) {
      console.error("Storage delete failed:", storageError);
      return NextResponse.json(
        { success: false, error: storageError.message },
        { status: 500 }
      );
    }

    // 3. Delete DB record
    const { error: deleteError } = await supabase
      .from("installation_product_images")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    // 4. Re-normalize sort_order for remaining images
    const { data: remaining } = await supabase
      .from("installation_product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (remaining && remaining.length > 0) {
      for (let index = 0; index < remaining.length; index++) {
        const img = remaining[index];

        await supabase
          .from("installation_product_images")
          .update({ sort_order: index })
          .eq("id", img.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE IMAGE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
