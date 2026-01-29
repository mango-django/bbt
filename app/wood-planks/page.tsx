import { supabaseServerAuth } from "@/lib/supabase/server-auth";
import WoodPlankCard from "./WoodPlankCard";

export const dynamic = "force-dynamic";

export default async function WoodPlanksPage() {
  const supabase = await supabaseServerAuth();

  const { data: planks, error } = await supabase
    .from("wood_planks")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return (
      <div className="max-w-7xl mx-auto p-10">
        <p className="text-red-600">Failed to load wood planks.</p>
      </div>
    );
  }

    return (
    <div className="max-w-7xl mx-auto p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">Wood Planks</h1>
        <p className="text-gray-600 max-w-2xl">
          Premium wood plank flooring sold per box. Each product shows box
          coverage so you can calculate exactly what you need.
        </p>
      </div>

      {planks && planks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {planks.map((plank) => (
            <WoodPlankCard key={plank.id} plank={plank} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No wood planks available.</p>
      )}
    </div>
  );
}