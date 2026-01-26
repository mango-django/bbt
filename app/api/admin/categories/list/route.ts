import { NextResponse } from "next/server";
import { supabaseAdmin, requireAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  const admin = supabaseAdmin();

    const { data, error } = await admin
      .from("categories")
      .select("id, name, slug")
      .order("name");

    if (error) {
      console.error("CATEGORY LIST ERROR:", error);
      return NextResponse.json(
        { error: "Failed to load categories" },
        { status: 500 }
      );
    }

    const categories = data ? [...data] : [];

    if (!categories.some((cat) => cat.slug === "floor")) {
      const { data: floorCategory, error: floorError } = await admin
        .from("categories")
        .insert({ name: "Floor", slug: "floor" })
        .select("id, name, slug")
        .single();

      if (!floorError && floorCategory) {
        categories.push(floorCategory);
      }
    }

    categories.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ categories });
}
