import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, image_url")
      .order("name");

    if (error) {
      console.error("PUBLIC CATEGORIES ERROR:", error);
      return NextResponse.json(
        { success: false, error: "Failed to load categories" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, categories: data ?? [] });
  } catch (err: any) {
    console.error("PUBLIC CATEGORIES ERROR:", err);
    return NextResponse.json(
      { success: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
