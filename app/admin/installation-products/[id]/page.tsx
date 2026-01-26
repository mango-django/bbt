import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ProductInstallationForm from "../_components/ProductInstallationForm";

export default async function EditInstallationProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await supabaseAdmin();

  const { data: images } = await supabase
  .from("installation_product_images")
  .select("*")
  .eq("product_id", id)
  .order("created_at", { ascending: true });

  


  const { data: product, error } = await supabase
    .from("installation_products")
    .select("*, installation_product_images(*)")
    .eq("id", id)
    .single();

  if (error || !product) {
    console.error("Could not load installation product:", error);
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <p>The installation product with ID {id} does not exist.</p>

        <Link
          href="/admin/installation-products"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Installation Product</h1>

      <ProductInstallationForm
        mode="edit"
        product={{
          id: product.id,
          name: product.name || "",
          slug: product.slug || "",
          product_type: product.product_type || "adhesive",
          colour: product.colour || "N/A",
          unit_type: product.unit_type || "kg",
          unit_amount: product.unit_amount || "",
          description: product.description || "",
          price: product.price?.toString() ?? "0",
          stock_qty: product.stock_qty?.toString() ?? "0",
          status: product.status || "active",
          images:
            images?.map((img) => ({
              id: img.id,
              url: img.url,
              file_path: img.url,
            })) ||
            product.installation_product_images ||
            [],
          seo_title: product.seo_title || "",
          seo_description: product.seo_description || "",
          seo_keywords: product.seo_keywords || "",
          display_id: product.display_id || "",
          supplier_id: product.supplier_id || "",
        }}
      />
    </div>
  );
}
