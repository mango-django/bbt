import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: 401 }
    );
  }

  if (!id) {
    return NextResponse.json(
      { error: "Missing order ID" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { status, tracking_number } = body;

  if (!status) {
    return NextResponse.json(
      { error: "Missing status" },
      { status: 400 }
    );
  }

  const supabase = supabaseAdmin();

  const { error } = await supabase
    .from("orders")
    .update({
      status,
      tracking_number: tracking_number || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("ORDER UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
