import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ products: [] });
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("installation_products")
    .select("id,name,slug")
    .ilike("status", "active")
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(6);

  if (error) {
    console.error("INSTALLATION SEARCH ERROR:", error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }

  return NextResponse.json({ products: data ?? [] });
}
