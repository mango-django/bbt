import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServerAuth } from "@/lib/supabase/server-auth";
import LogoutButton from "@/components/account/LogoutButton";
import AdminClientShell from "@/components/admin/AdminClientShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServerAuth();

  // 🔐 Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  // 🔑 Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/account");
  }

  return (
    <div className="min-h-screen flex bg-[#f5f5f5] text-[#2b2b2b]">
      {/* CLIENT SIDE ADMIN LOGIC */}
      <AdminClientShell />

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1f1f1f] text-white p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>

        <nav className="flex flex-col gap-4 text-white/80">
          <Link href="/admin">Home</Link>
          <Link href="/admin/products">Products</Link>
          <Link href="/admin/featured-products" className="text-yellow-300/90 hover:text-yellow-200">
            Featured Products
          </Link>
          <Link href="/admin/wood-planks">Wood Planks</Link>
          <Link href="/admin/installation-products">
            Installation Products
          </Link>
          <Link href="/admin/orders">Orders</Link>
        </nav>

        <div className="mt-auto pt-6">
          <LogoutButton />
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
