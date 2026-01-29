import WoodPlankFormClient from "@/components/WoodPlankFormClient";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

export default async function CreateWoodPlankPage() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return <div className="p-10 text-red-600">{auth.error}</div>;
  }

  const admin = supabaseAdmin();
  const id = randomUUID();
  const slug = `wood-plank-${id}`;

  try {
    const { data, error } = await admin
      .from("wood_planks")
      .insert([
        {
          id,
          title: "",
          slug,
          description: "",
          price_per_box: null,
          coverage_per_box: null,

          plank_length_mm: null,
          plank_width_mm: null,
          thickness_mm: null,

          boxes_in_stock: null,
          weight_per_box: null,

          images: [],
          meta_title: "",
          meta_description: "",
          og_image_url: "",

          is_active: false,
        },
      ])
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error("Missing wood plank ID");
    }

    return <WoodPlankFormClient mode="create" plankId={data.id} />;
  } catch (err) {
    console.error("WOOD PLANK CREATE ERROR:", err);
    return (
      <div className="p-10 text-red-600">
        Unable to start a new wood plank.
      </div>
    );
  }
}
