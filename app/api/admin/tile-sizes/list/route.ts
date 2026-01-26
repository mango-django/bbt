import { NextResponse } from "next/server";
import { supabaseAdmin, requireAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin.from("tile_sizes").select("*");

  if (error)
    return NextResponse.json({
      error: error.message,
    });

  const sizes = Array.isArray(data) ? [...data] : [];
  const extras = [
    { id: "custom-298x600", label: "298 x 600", width_mm: 298, height_mm: 600 },
    { id: "custom-297x597", label: "297x597", width_mm: 297, height_mm: 597 },
    { id: "custom-900x900", label: "900x900", width_mm: 900, height_mm: 900 },
    { id: "custom-1000x1000", label: "1000x1000", width_mm: 1000, height_mm: 1000 },
    { id: "custom-1198x598", label: "1198x598", width_mm: 1198, height_mm: 598 },
    { id: "custom-1950x1200", label: "1950 x 1200", width_mm: 1950, height_mm: 1200 },
  ];

  for (const extra of extras) {
    const exists = sizes.some(
      (size) =>
        String(size?.label ?? "").toLowerCase() === extra.label.toLowerCase()
    );
    if (!exists) {
      sizes.push(extra);
    }
  }

  sizes.sort((a, b) =>
    String(a?.label ?? "").localeCompare(String(b?.label ?? ""))
  );

  return NextResponse.json({ tile_sizes: sizes });
}
