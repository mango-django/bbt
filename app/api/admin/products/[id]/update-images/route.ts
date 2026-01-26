import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const { images } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Missing product ID" },
        { status: 400 }
      );
    }

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { success: false, error: "Images must be an array." },
        { status: 400 }
      );
    }

    // IMPORTANT: must await or admin = Promise
    const admin = await supabaseAdmin();

    // Validate
    for (const img of images) {
      if (!img.id) {
        return NextResponse.json(
          { success: false, error: "Image is missing an id." },
          { status: 400 }
        );
      }
    }

    // Bulk update sort order
    await Promise.all(
      images.map((img: any, index: number) =>
        admin
          .from("product_images")
          .update({ sort_order: index })
          .eq("id", img.id)
      )
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("UPDATE-IMAGES ERROR:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to update image sort order",
      },
      { status: 500 }
    );
  }
}
