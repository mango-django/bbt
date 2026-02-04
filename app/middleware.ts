import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  return res;
}

export const config = {
  matcher: [
    /*
     * Run on all routes except static assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
