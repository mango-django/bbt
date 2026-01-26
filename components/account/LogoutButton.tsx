"use client";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = supabaseBrowser();

    await supabase.auth.signOut();

    // FULL reload to clear server session
    window.location.href = "/";
  }

  return (
    <button onClick={handleLogout} className={className}>
      Log out
    </button>
  );
}
