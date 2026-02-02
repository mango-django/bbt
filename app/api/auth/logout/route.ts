import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  // Clear explicit auth cookies used by legacy/custom auth routes.
  cookieStore.set("sb-access-token", "", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
  });
  cookieStore.set("sb-refresh-token", "", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
  });

  // Clear any Supabase cookies created by @supabase/ssr (including chunked cookies).
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      cookieStore.set(cookie.name, "", {
        path: "/",
        maxAge: 0,
      });
    }
  }

  return NextResponse.json({ success: true });
}
