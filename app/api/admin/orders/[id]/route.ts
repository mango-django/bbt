import { NextResponse } from "next/server";
import { supabaseAdmin, requireAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id: orderId } = await params;

  if (!orderId) {
    return NextResponse.json(
      { error: "Missing order ID" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { status, tracking_number } = body;

  if (!status) {
    return NextResponse.json(
      { error: "Missing status" },
      { status: 400 }
    );
  }

  const supabase = supabaseAdmin();

  const { data: existingOrder, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchError || !existingOrder) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  const wasAlreadyDispatched = Boolean(existingOrder.dispatched_at);
  const isNowDispatched = status === "dispatched";

  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      status,
      tracking_number: tracking_number || null,
      dispatched_at:
        isNowDispatched && !wasAlreadyDispatched
          ? new Date().toISOString()
          : existingOrder.dispatched_at,
    })
    .eq("id", orderId)
    .select()
    .single();

  if (updateError) {
    console.error("ORDER UPDATE ERROR:", updateError);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }

  if (isNowDispatched && !wasAlreadyDispatched) {
    try {
      const { sendOrderDispatchedEmail } = await import(
        "@/lib/email/sendOrderDispatched"
      );
      await sendOrderDispatchedEmail(updatedOrder);
    } catch (err) {
      console.error("DISPATCH EMAIL ERROR:", err);
    }
  }

  return NextResponse.json({ success: true, order: updatedOrder });
}
