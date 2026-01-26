import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const productId = formData.get("product_id") as string;

    if (!file || !productId) {
      return NextResponse.json(
        { success: false, error: "Missing file or product_id" },
        { status: 400 }
      );
    }

    const supabase = await supabaseAdmin();

    const fileExt = file.name.split(".").pop();
    const filePath = `${productId}/${Date.now()}.${fileExt}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from("installation-products")
      .upload(filePath, file, {
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    // Generate public URL
    const { data: urlData } = supabase.storage
      .from("installation-products")
      .getPublicUrl(filePath);

    // Insert into DB
    const { data, error } = await supabase
      .from("installation_product_images")
      .insert({
        product_id: productId,
        url: urlData.publicUrl,
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      image: {
        id: data.id,
        url: data.url,
        file_path: filePath,
      },
    });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
