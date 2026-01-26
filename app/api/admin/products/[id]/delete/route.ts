import { NextResponse } from "next/server";
import { supabaseAdmin, requireAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }
    const admin = supabaseAdmin();

    const { id: productId } = await params;

    // -----------------------------
    // 1) Load images to delete from bucket
    // -----------------------------
    const { data: images, error: imgError } = await admin
      .from("product_images")
      .select("image_url")
      .eq("product_id", productId);

    if (imgError) {
      console.error("LOAD IMAGES ERROR:", imgError);
    }

    // -----------------------------
    // 2) Delete images from storage (optional but recommended)
    // -----------------------------
    if (images && images.length > 0) {
      const paths = images.map((img) =>
        img.image_url.replace(/^.*\/images\//, "")
      );

      // Delete from Supabase storage bucket 'product-images'
      await admin.storage.from("product-images").remove(paths);
    }

    // -----------------------------
    // 3) Delete related rows
    // -----------------------------
    await admin.from("product_images").delete().eq("product_id", productId);
    await admin.from("product_categories").delete().eq("product_id", productId);

    // -----------------------------
    // 4) Delete the product
    // -----------------------------
    const { error: deleteError } = await admin
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      console.error("DELETE PRODUCT ERROR:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PRODUCT DELETE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
