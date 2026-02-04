"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

/* ------------------------------------------
   ORDER TYPE (minimal + safe)
------------------------------------------ */
type Order = {
  id: string;
  order_ref: string;
  status: string;
  total: number;
  created_at: string;
};

export default function AdminOrderNotifier() {
  useEffect(() => {
    const supabase = supabaseBrowser();

    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload: RealtimePostgresChangesPayload<Order>) => {
  const order = payload.new;

  // ✅ TYPE GUARD (this is the missing piece)
  if (!order || typeof order !== "object" || !("order_ref" in order)) {
    return;
  }

  toast.success(
    `🛒 New order received (${order.order_ref})`,
    {
      duration: 6000,
    }
  );
}
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
