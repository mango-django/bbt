import { supabaseServer } from "@/lib/supabase/server";
import InstallationProductPageClient from "@/app/installation-products/[slug]/InstallationProductPageClient";

export default async function InstallationProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("installation_products")
    .select("*, installation_product_images(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("INSTALLATION PRODUCT LOAD ERROR:", error);
    return (
      <div className="p-10 text-center text-gray-600">
        Installation product not found.
      </div>
    );
  }

  const images = Array.isArray(data.installation_product_images)
    ? data.installation_product_images
    : [];

  return <InstallationProductPageClient product={data} images={images} />;
}
