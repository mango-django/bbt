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
    await supabase.auth.signOut();
  } finally {
    // Hard reload guarantees cookie + state reset in prod
    window.location.href = "/";
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
