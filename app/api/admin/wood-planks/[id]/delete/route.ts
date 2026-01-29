import { NextResponse } from "next/server";
import { supabaseAdmin, requireAdmin } from "@/lib/supabase/admin";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const admin = supabaseAdmin();
    const { id } = await params;

    const { error } = await admin
      .from("wood_planks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("WOOD PLANK DELETE ERROR:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete wood plank." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WOOD PLANK DELETE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
