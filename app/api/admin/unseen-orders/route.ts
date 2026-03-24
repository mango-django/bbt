import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const admin = supabaseAdmin();

  const { count, error } = await admin
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("seen_by_admin", false)
    .eq("payment_status", "paid");

  if (error) {
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({ count: count ?? 0 });
}
