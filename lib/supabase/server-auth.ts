// lib/supabase/server-auth.ts

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function supabaseServerAuth() {
  const cookieStore = await cookies(); // ✅ MUST await in Next 15+

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

