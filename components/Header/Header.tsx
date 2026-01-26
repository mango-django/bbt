"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiSearch, FiShoppingCart } from "react-icons/fi";
import { useCart } from "@/app/context/CartContext";
import AuthModal from "@/components/auth/AuthModal";
import { supabaseBrowser } from "@/lib/supabase/client";

type NavCategory = {
  id: string;
  name: string;
  slug: string;
};

export default function Header() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tab, setTab] = useState<"menu" | "categories">("menu");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity ?? 1), 0);

  /* -------------------------------------------------
     AUTH BOOTSTRAP
  ------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      const user = data.session?.user ?? null;
      setUserEmail(user?.email ?? null);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setIsAdmin(profile?.role === "admin");
      } else {
        setIsAdmin(false);
      }

    }

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null;

        setUserEmail(user?.email ?? null);

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          setIsAdmin(profile?.role === "admin");
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  /* -------------------------------------------------
     CATEGORY LOAD
  ------------------------------------------------- */
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/public/categories", { cache: "no-store" });
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json?.error || "Failed to load categories");
        }

        setCategories(json.categories ?? []);
      } catch (err: any) {
        setCategories([]);
        setCategoriesError(err.message);
      }
    }

    loadCategories();
  }, []);

  function buildCategoryHref(cat: NavCategory) {
    return `/category/${cat.slug}`;
  }

  return (
    <>
      {/* TOP HEADER */}
      <div className="border-b border-black bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="font-semibold text-2xl tracking-wide">
            BELLOS
          </Link>

          <div className="hidden md:flex flex-1 mx-4">
            <input
              placeholder="Search for tiles..."
              className="w-full border border-white/30 bg-white/10 rounded-md px-4 py-2 text-sm"
            />
          </div>

          {/* AUTH */}
          <div className="flex items-center gap-4">
            {userEmail ? (
              <Link href="/account" className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  {userEmail[0].toUpperCase()}
                </span>
                <span className="hidden md:inline">{userEmail}</span>
              </Link>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="text-sm font-medium"
              >
                Login / Sign Up
              </button>
            )}

            <Link href="/cart" className="relative">
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

     {/* DESKTOP NAV */}
<nav className="hidden md:block border-b bg-white">
  <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 py-3">
    <Link
      href="/"
      className="text-neutral-600 font-light hover:text-neutral-800"
    >
      Home
    </Link>

    {/* Heavy page – disable prefetch */}
    <Link
      href="/visualiser"
      prefetch={false}
      className="text-neutral-600 font-light hover:text-neutral-800"
    >
      Tile Visualiser
    </Link>

    <Link
      href="/installation-products"
      className="text-neutral-600 font-light hover:text-neutral-800"
    >
      Installation Products
    </Link>

    <Link
      href="/faqs"
      className="text-neutral-600 font-light hover:text-neutral-800"
    >
      FAQs
    </Link>

    <Link
      href="/about"
      className="text-neutral-600 font-light hover:text-neutral-800"
    >
      About
    </Link>

    <Link
      href="/contact-us"
      className="text-neutral-600 font-light hover:text-neutral-800"
    >
      Contact
    </Link>

    {isAdmin && (
      <Link
        href="/admin"
        className="text-neutral-600 font-light hover:text-neutral-800"
      >
        Admin
      </Link>
    )}
  </div>
</nav>


      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        redirectTo="/"
      />
    </>
  );
}
