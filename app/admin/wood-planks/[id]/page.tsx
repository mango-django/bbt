import { requireAdmin, supabaseAdmin } from "@/lib/supabase/admin";
import WoodPlankFormClient from "@/components/WoodPlankFormClient";

export default async function EditWoodPlankPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await requireAdmin();
  if (!auth.ok) {
    return <div className="p-10 text-red-600">{auth.error}</div>;
  }

  const admin = supabaseAdmin();
  const { data: plank } = await admin
    .from("wood_planks")
    .select("*")
    .eq("id", id)
    .single();

  if (!plank) {
    return <div className="p-10 text-red-600">Wood plank not found.</div>;
  }

  return <WoodPlankFormClient plank={plank} />;
}
