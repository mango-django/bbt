import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...payload } = body ?? {};

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing wood plank ID." },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();

    const { error } = await admin
      .from("wood_planks")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("WOOD PLANK SAVE ERROR:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WOOD PLANK SAVE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
