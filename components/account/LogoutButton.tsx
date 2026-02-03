"use client";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useState } from "react";

export default function LogoutButton({ className }: { className?: string }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const supabase = supabaseBrowser();

    try {
      // Avoid hanging the UI if revoke-token request stalls in some browsers.
      await Promise.race([
        supabase.auth.signOut({ scope: "local" }),
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ]);

      // Clear server-side/legacy auth cookies as a second pass.
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      }).catch(() => undefined);
    } finally {
      // Hard reload guarantees client + server auth state resets.
      window.location.replace("/");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={className}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? "Logging out..." : "Log out"}
    </button>
  );
}
