"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import toast from "react-hot-toast";

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
        (payload) => {
          const order = payload.new as any;

          toast.success(`🛒 New order received (${order.order_ref})`, {
            duration: 6000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
