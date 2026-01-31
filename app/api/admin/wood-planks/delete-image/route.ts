import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const plankId = body.plank_id;
    const url = body.url;
    const filePath = body.file_path;

    if (!plankId || !url || !filePath) {
      return NextResponse.json(
        { success: false, error: "Missing plank_id, url, or file_path" },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();

    /* --------------------------------------------
       1. DELETE FROM SUPABASE STORAGE
    --------------------------------------------- */
    const { error: storageError } = await admin.storage
      .from("wood-planks")
      .remove([filePath]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
      return NextResponse.json(
        { success: false, error: "Failed to delete file" },
        { status: 500 }
      );
    }

    /* --------------------------------------------
       2. UPDATE DB ARRAY
    --------------------------------------------- */
    const { data: plank, error: fetchError } = await admin
      .from("wood_planks")
      .select("images")
      .eq("id", plankId)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { success: false, error: "Failed to load wood plank images" },
        { status: 500 }
      );
    }

    const existing = Array.isArray(plank?.images) ? plank.images : [];
    const nextImages = existing.filter((img: string) => img !== url);

    const { error: updateError } = await admin
      .from("wood_planks")
      .update({ images: nextImages })
      .eq("id", plankId);

    if (updateError) {
      console.error("DB update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update wood plank images" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted",
    });
  } catch (err: any) {
    console.error("Delete API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
