import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase/admin";
import { sendOrderDispatchedEmail } from "@/lib/email/sendOrderDispatched";

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

  const updatePayload: Record<string, unknown> = {
    status,
    tracking_number: tracking_number || null,
    updated_at: new Date().toISOString(),
  };

  if (status === "dispatched") {
    updatePayload.dispatched_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    console.error("ORDER UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }

  // Send dispatch notification email to customer
  if (status === "dispatched") {
    try {
      const { data: order } = await supabase
        .from("orders")
        .select("customer_email, order_ref, tracking_number")
        .eq("id", id)
        .single();

      if (order) {
        await sendOrderDispatchedEmail({
          customer_email: order.customer_email,
          public_order_id: order.order_ref,
          tracking_number: order.tracking_number,
        });
      }
    } catch (emailErr) {
      console.error("Failed to send dispatch email:", emailErr);
    }
  }

  return NextResponse.json({ success: true });
}
