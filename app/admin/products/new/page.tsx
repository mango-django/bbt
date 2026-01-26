import ProductFormClient from "@/app/admin/products/components/ProductFormClient";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export default async function CreateProductPage() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return (
      <div className="p-10 text-red-600">
        {auth.error}
      </div>
    );
  }

  const admin = supabaseAdmin();
  const id = randomUUID();
  

  try {
    const { data, error } = await admin
      .from("products")
      .insert([
        {
          id,
          status: "draft",
          title: "",
          slug: null,
          description: "",

          material: null,
          finish: null,
          indoor_outdoor: null,

          color: [],
          application: [],
          suitable_room: [],
          category_ids: [],

          dimension_string: null,
          tile_width_mm: null,
          tile_height_mm: null,
          tile_thickness_mm: null,

          price_per_m2: null,
          price_per_tile: null,
          price_per_box: null,

          tiles_per_box: null,
          box_coverage_m2: null,
          box_weight_kg: null,
          boxes_in_stock: null,
          boxes_per_pallet: null,
          lead_time_days: null,

          meta_title: "",
          meta_description: "",
          og_image_url: "",

          display_id: "",
          supplier_id: "",

          attributes: [],
        },
      ])
      .select("id")
      .single();

    if (error || !data) {
      console.error("PRODUCT CREATE ERROR:", error);
      throw error ?? new Error("Missing product ID after draft insert");
    }

    return <ProductFormClient mode="create" productId={data.id} />;
  } catch (err) {
    console.error("Failed to create draft product", err);
    return (
      <div className="p-10 text-red-600">
        Unable to start a new product. Please try again.
      </div>
    );
  }
}
