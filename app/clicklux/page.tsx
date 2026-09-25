import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ClickLuxFormatSection from "./ClickLuxFormatSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ClickLux SPC Flooring",
  description:
    "Shop ClickLux waterproof SPC click flooring — rigid-core planks, herringbone and tile formats with built-in underlay. UK-wide delivery from Bellos Bespoke Tiles.",
  alternates: { canonical: "/clicklux" },
};

// Friendly names for the known ClickLux formats; anything new falls back to
// its raw dimensions so it still gets a section without a code change.
const FORMAT_LABELS: Record<string, string> = {
  "610x305": "Tile Format",
  "630x126": "Herringbone",
  "1219x178": "Rigid Plank",
  "1219x229": "Premium Plank",
};

type PlankRow = {
  id: string;
  title: string;
  slug: string | null;
  images: string[] | null;
  price_per_box: number | null;
  coverage_per_box: number | null;
  plank_length_mm: number | null;
  plank_width_mm: number | null;
  thickness_mm: number | null;
};

export default async function ClickLuxPage() {
  const supabase = supabaseAdmin();

  const { data: planks, error } = await supabase
    .from("wood_planks")
    .select(
      "id, title, slug, images, price_per_box, coverage_per_box, plank_length_mm, plank_width_mm, thickness_mm"
    )
    .eq("is_active", true)
    .eq("range", "clicklux")
    .order("title", { ascending: true });

  if (error) {
    console.error(error);
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#9A7A5E] mb-2">Error</p>
          <p className="text-sm text-[#6B6B6B]">Failed to load ClickLux flooring.</p>
        </div>
      </div>
    );
  }

  // Group by plank size (length × width), ordered smallest to largest.
  const groups = new Map<string, PlankRow[]>();
  for (const plank of (planks ?? []) as PlankRow[]) {
    const key = `${plank.plank_length_mm ?? 0}x${plank.plank_width_mm ?? 0}`;
    const group = groups.get(key);
    if (group) {
      group.push(plank);
    } else {
      groups.set(key, [plank]);
    }
  }
  const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) => {
    const [al, aw] = a.split("x").map(Number);
    const [bl, bw] = b.split("x").map(Number);
    return al - bl || aw - bw;
  });

  const totalCount = planks?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      {/* Breadcrumb */}
      <div className="border-b border-[#E8E5E0] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-4">
          <nav className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase">
            <Link href="/" className="text-[#9A7A5E] hover:text-[#7A5E44] transition-colors">
              Home
            </Link>
            <span className="text-[#D4CFC8]">/</span>
            <span className="text-[#1A1A1A]">ClickLux</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-10">

        {/* Top bar */}
        <div className="pb-7 border-b border-[#E8E5E0] mb-10">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mb-1">
            Flooring
          </p>
          <h1 className="text-2xl sm:text-3xl font-light tracking-wider text-[#1A1A1A]">
            ClickLux SPC Flooring
          </h1>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mt-1.5">
            {sortedGroups.length} size{sortedGroups.length !== 1 ? "s" : ""} ·{" "}
            {totalCount} colour{totalCount !== 1 ? "s" : ""}
          </p>
        </div>

        {sortedGroups.length > 0 ? (
          <div className="space-y-10">
            {sortedGroups.map(([sizeKey, groupPlanks]) => {
              const [length, width] = sizeKey.split("x");
              const label =
                FORMAT_LABELS[sizeKey] ?? `${length} × ${width}mm`;
              return (
                <div key={sizeKey}>
                  {/* Size group heading */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-px bg-[#9A7A5E]" />
                    <p className="text-[11px] tracking-[0.35em] uppercase text-[#9A7A5E]">
                      {label}
                    </p>
                    <p className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A]/50">
                      {length} × {width}mm
                    </p>
                  </div>
                  <ClickLuxFormatSection
                    formatLabel={label}
                    planks={groupPlanks}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#9A7A5E] mb-2">No results</p>
            <p className="text-sm text-[#6B6B6B]">No ClickLux flooring available at this time.</p>
          </div>
        )}

      </div>
    </div>
  );
}
