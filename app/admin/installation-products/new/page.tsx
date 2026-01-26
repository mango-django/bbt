import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export default async function CreateInstallationProductPage() {
  const supabase = await supabaseAdmin();

  const id = randomUUID();
  

  const { data, error } = await supabase
    .from("installation_products")
    .insert({
      id,
      name: "",
      slug: `product-${id}`,
      product_type: "adhesive",
      colour: "N/A",
      unit_type: "kg",
      unit_amount: "",
      description: "",
      price: 0,
      stock_qty: 0,
      status: "draft",

      // SEO defaults
      seo_title: "",
      seo_description: "",
      seo_keywords: "",

      // Identifiers
      display_id: "",
      supplier_id: "",
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("Failed to create draft installation product:", error);
    throw new Error("Failed to create draft installation product.");
  }

  // Redirect to edit page immediately
  redirect(`/admin/installation-products/${data.id}`);
}
