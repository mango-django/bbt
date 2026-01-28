import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("installation_products")
    .select("*, installation_product_images(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Get error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }

  return NextResponse.json({ success: true, product: data });
}
