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
      // Clear any server cookies used by auth guards.
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continue even if the API request fails.
    }

    // Always clear local session so client-side auth state resets.
    await supabase.auth.signOut({ scope: "local" });

    // Full reload to reset both client and server auth state.
    window.location.assign("/");
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
