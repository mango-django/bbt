import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  const admin = supabaseAdmin();

  await admin
    .from("orders")
    .update({ seen_by_admin: true })
    .eq("seen_by_admin", false)
    .eq("payment_status", "paid");

  return NextResponse.json({ ok: true });
}
