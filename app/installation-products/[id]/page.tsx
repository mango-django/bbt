import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import InstallationProductPageClient from "@/app/installation-products/[slug]/InstallationProductPageClient";

export default async function InstallationProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("installation_products")
    .select("*, installation_product_images(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("INSTALLATION PRODUCT LOAD ERROR:", error);
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#9A7A5E] mb-3">Not Found</p>
          <p className="text-sm text-[#6B6B6B] mb-6">This product could not be found.</p>
          <Link
            href="/installation-products"
            className="text-[10px] tracking-[0.25em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:text-[#9A7A5E] hover:border-[#9A7A5E] transition-colors"
          >
            Browse Installation Products
          </Link>
        </div>
      </div>
    );
  }

  const images = Array.isArray(data.installation_product_images)
    ? data.installation_product_images
    : [];

  return <InstallationProductPageClient product={data} images={images} />;
}
