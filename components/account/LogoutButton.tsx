"use client";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useState } from "react";

export default function LogoutButton({ className }: { className?: string }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const supabase = supabaseBrowser();

    // Run both logout flows and always finish by returning the user home.
    await Promise.allSettled([
      fetch("/api/auth/logout", { method: "POST" }),
      supabase.auth.signOut({ scope: "local" }),
    ]);

    // Full reload to reset both client and server auth state.
    window.location.replace("/");
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
