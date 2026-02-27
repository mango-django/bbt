import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import WoodPlankCard from "./WoodPlankCard";

export const dynamic = "force-dynamic";

export default async function WoodPlanksPage() {
  const supabase = supabaseAdmin();

  const { data: planks, error } = await supabase
    .from("wood_planks")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#9A7A5E] mb-2">Error</p>
          <p className="text-sm text-[#6B6B6B]">Failed to load wood planks.</p>
        </div>
      </div>
    );
  }

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
            <span className="text-[#1A1A1A]">Wood Planks</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-10">

        {/* Top bar */}
        <div className="pb-7 border-b border-[#E8E5E0] mb-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mb-1">
            Flooring
          </p>
          <h1 className="text-2xl sm:text-3xl font-light tracking-wider text-[#1A1A1A]">
            Wood Planks
          </h1>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mt-1.5">
            {planks?.length ?? 0} product{(planks?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>

        {planks && planks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {planks.map((plank) => (
              <WoodPlankCard key={plank.id} plank={plank} />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#9A7A5E] mb-2">No results</p>
            <p className="text-sm text-[#6B6B6B]">No wood planks available at this time.</p>
          </div>
        )}

      </div>
    </div>
  );
}
