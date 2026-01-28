import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await context.params;
  const { images } = await req.json();

  if (!images || !Array.isArray(images)) {
    return NextResponse.json(
      { success: false, error: "Invalid images payload" },
      { status: 400 }
    );
  }

  const supabase = await supabaseAdmin();

  try {
    // Normalize sort order to sequential 0..n
    const normalized = images.map((img: any, index: number) => ({
      id: img.id,
      sort_order: index,
    }));

    // Batch update each image
    for (const entry of normalized) {
      await supabase
        .from("installation_product_images")
        .update({ sort_order: entry.sort_order })
        .eq("id", entry.id)
        .eq("product_id", productId); // safety check
    }

    // Fetch updated list
    const { data: updated, error } = await supabase
      .from("installation_product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      images: updated,
    });
  } catch (err: any) {
    console.error("SORT ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
