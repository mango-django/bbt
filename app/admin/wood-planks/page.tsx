import Link from "next/link";
import { requireAdmin, supabaseAdmin } from "@/lib/supabase/admin";
import DeleteWoodPlankButton from "./_components/DeleteWoodPlankButton";

export default async function AdminWoodPlanksPage() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return <div className="p-10 text-red-600">{auth.error}</div>;
  }

  const admin = supabaseAdmin();
  const { data: planks } = await admin
    .from("wood_planks")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Wood Planks</h1>
        <Link
          href="/admin/wood-planks/new"
          className="px-4 py-2 bg-black text-white"
        >
          + New Wood Plank
        </Link>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Title</th>
            <th className="p-3">£ / Box</th>
            <th className="p-3">Coverage</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Active</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {planks?.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-3">{p.title}</td>
              <td className="p-3">£{p.price_per_box}</td>
              <td className="p-3">{p.coverage_per_box} m²</td>
              <td className="p-3">{p.boxes_in_stock ?? "—"}</td>
              <td className="p-3">{p.is_active ? "Yes" : "No"}</td>
              <td className="p-3 text-right space-x-3">
                <Link
                  href={`/admin/wood-planks/${p.id}`}
                  className="text-blue-600"
                >
                  Edit
                </Link>
                <DeleteWoodPlankButton plankId={p.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
