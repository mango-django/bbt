"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

export default function Header() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1️⃣ LOAD INITIAL SESSION (THIS IS THE MISSING PIECE)
   supabase.auth.getSession().then(
  ({ data }: { data: { session: Session | null } }) => {
    if (!mounted) return;
    setUser(data.session?.user ?? null);
    setLoading(false);
  }
);


    // 2️⃣ LISTEN FOR LOGIN / LOGOUT
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-lg">
          YourSite
        </Link>

        {/* Avoid flicker while loading */}
        {!loading && (
          <>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Hi {user.user_metadata?.full_name || user.email}
                </span>

                <Link
                  href="/account"
                  className="text-sm font-medium underline"
                >
                  Account
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">Login</Link>
                <Link href="/signup">Sign up</Link>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
