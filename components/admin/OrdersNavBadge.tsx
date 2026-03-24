"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type OrderRow = {
  id: string;
  payment_status: string;
  seen_by_admin: boolean;
};

export default function OrdersNavBadge() {
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  const fetchCount = async () => {
    try {
      const res = await fetch("/api/admin/unseen-orders");
      const data = await res.json();
      setCount(data.count ?? 0);
    } catch {
      // silently ignore
    }
  };

  // Mark orders as seen when admin is on the orders pages
  useEffect(() => {
    if (pathname?.startsWith("/admin/orders")) {
      setCount(0);
      fetch("/api/admin/mark-orders-seen", { method: "POST" });
    }
  }, [pathname]);

  // Initial fetch + real-time subscription
  useEffect(() => {
    fetchCount();

    const supabase = supabaseBrowser();

    const channel = supabase
      .channel("orders-nav-badge")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload: RealtimePostgresChangesPayload<OrderRow>) => {
          const updated = payload.new as OrderRow;
          if (updated.payment_status === "paid" && updated.seen_by_admin === false) {
            fetchCount();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload: RealtimePostgresChangesPayload<OrderRow>) => {
          const inserted = payload.new as OrderRow;
          if (inserted.payment_status === "paid") {
            fetchCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Link href="/admin/orders" className="flex items-center gap-2">
      Orders
      {count > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5 leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
