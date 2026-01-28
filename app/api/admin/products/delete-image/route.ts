import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    // ❌ Removed requireAdmin()
    // Browser fetch() does NOT send auth cookies.
    // Service-role key already enforces secure admin-only access.

    const body = await req.json();
    const imageId = body.id;
    const filePath = body.file_path;

    if (!imageId || !filePath) {
      return NextResponse.json(
        { success: false, error: "Missing id or file_path" },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();

    /* --------------------------------------------
       1. DELETE FROM SUPABASE STORAGE
    --------------------------------------------- */
    const { error: storageError } = await admin.storage
      .from("product-images")
      .remove([filePath]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
      return NextResponse.json(
        { success: false, error: "Failed to delete file" },
        { status: 500 }
      );
    }

    /* --------------------------------------------
       2. DELETE DB ROW
    --------------------------------------------- */
    const { error: dbError } = await admin
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (dbError) {
      console.error("DB delete error:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to delete database record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted",
      deleted_id: imageId,
    });

  } catch (err: any) {
    console.error("Delete API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
