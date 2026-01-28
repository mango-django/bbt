import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, requireAdmin } from "@/lib/supabase/admin";

 

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

    if (!productId) {
      return NextResponse.json(
        { error: "Missing installation product id" },
        { status: 400 }
      );
    }

    // -----------------------------
    // 1) Load images to delete from bucket
    // -----------------------------
    const { data: images, error: imgError } = await admin
      .from("installation_product_images")
      .select("file_path")
      .eq("product_id", productId);

    if (imgError) {
      console.error("LOAD INSTALLATION PRODUCT IMAGES ERROR:", imgError);
    }

    // -----------------------------
    // 2) Delete images from storage (optional but recommended)
    // -----------------------------
    const paths =
      images?.map((img) => img.file_path).filter((path) => !!path) ?? [];

    if (paths.length > 0) {
      await admin.storage.from("installation-products").remove(paths);
    }

    // -----------------------------
    // 3) Delete related rows
    // -----------------------------
    const { error: imageDeleteError } = await admin
      .from("installation_product_images")
      .delete()
      .eq("product_id", productId);

    if (imageDeleteError) {
      console.error(
        "DELETE INSTALLATION PRODUCT IMAGES ERROR:",
        imageDeleteError
      );
      return NextResponse.json(
        { error: "Failed to delete product images" },
        { status: 500 }
      );
    }

    // -----------------------------
    // 4) Delete the product
    // -----------------------------
    const { error: deleteError } = await admin
      .from("installation_products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      console.error("DELETE INSTALLATION PRODUCT ERROR:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete installation product" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("INSTALLATION PRODUCT DELETE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
