import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const admin = supabaseAdmin();
    const formData = await req.formData();

    const plank_id = formData.get("plank_id") as string;
    const file = formData.get("file") as File;

    if (!plank_id) {
      return NextResponse.json(
        { error: "Missing plank_id" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${plank_id}/${Date.now()}-${file.name}`;

    /* ----------------------------------------------------
       1. UPLOAD FILE TO SUPABASE STORAGE
    ---------------------------------------------------- */
    const { error: uploadError } = await admin.storage
      .from("wood-planks")
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

    const publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wood-planks/${fileName}`;

    /* ----------------------------------------------------
       2. APPEND URL TO WOOD PLANK RECORD
    ---------------------------------------------------- */
    const { data: plank, error: fetchError } = await admin
      .from("wood_planks")
      .select("images")
      .eq("id", plank_id)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    const existing = Array.isArray(plank?.images) ? plank.images : [];
    const nextImages = [...existing, publicURL];

    const { error: updateError } = await admin
      .from("wood_planks")
      .update({ images: nextImages })
      .eq("id", plank_id);

    if (updateError) {
      console.error("DB update error:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: {
        url: publicURL,
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
