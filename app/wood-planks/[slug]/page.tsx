import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import WoodPlankClient from "./WoodPlankClient";

export const dynamic = "force-dynamic";

export default async function WoodPlankPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ✅ THIS IS THE FIX

  const supabase = supabaseAdmin();

  const decodedSlug = decodeURIComponent(slug);

  const { data: plank, error } = await supabase
    .from("wood_planks")
    .select("*")
    .eq("slug", decodedSlug)
    .eq("is_active", true)
    .single();

  if (error || !plank) {
    notFound();
  }

  return <WoodPlankClient plank={plank} />;
}
