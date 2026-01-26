import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import DeleteInstallationProductForm from "./_components/DeleteInstallationProductForm";

export const revalidate = 0;

export default async function InstallationProductsAdminPage() {
  const supabase = await supabaseAdmin();

  const { data: products, error } = await supabase
    .from("installation_products")
    .select(`
      id,
      name,
      product_type,
      price,
      unit_type,
      unit_amount,
      stock_qty,
      status,
      created_at,
      installation_product_images ( url )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load products:", error);
    return <div className="p-6">Failed to load installation products.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Installation Products</h1>

        <Link
          href="/admin/installation-products/new"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Add New
        </Link>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 w-20">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products?.length ? (
              products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="w-16 h-16 border rounded overflow-hidden bg-gray-50">
                      {p.installation_product_images?.[0]?.url ? (
                        <img
                          src={p.installation_product_images[0].url}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          N/A
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 capitalize">{p.product_type}</td>
                  <td className="px-4 py-3">£{Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {p.unit_amount} {p.unit_type}
                  </td>
                  <td className="px-4 py-3">{p.stock_qty}</td>
                  <td className="px-4 py-3 capitalize">{p.status}</td>

                  <td className="px-4 py-3 flex gap-3">
                    <Link
                      href={`/admin/installation-products/${p.id}`}
                      className="px-3 py-1 bg-indigo-600 text-white rounded text-xs"
                    >
                      Edit
                    </Link>

                    <DeleteInstallationProductForm productId={p.id} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center">
                  No installation products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
