"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMenu, FiSearch, FiX, FiShoppingCart } from "react-icons/fi";
import { useCart } from "@/app/context/CartContext";
import AuthModal from "@/components/auth/AuthModal";
import { supabaseBrowser } from "@/lib/supabase/client";
import type {
  AuthChangeEvent,
  Session,
  User,
} from "@supabase/supabase-js";

type NavCategory = {
  id: string;
  name: string;
  slug: string;
};

type ProductSearchItem = {
  id: string;
  title: string | null;
  slug: string | null;
  dimension_string?: string | null;
};

export default function Header() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity ?? 1), 0);

  /* -------------------------------------------------
     LOCK BODY SCROLL WHEN MOBILE MENU OPEN
  ------------------------------------------------- */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
  }, [mobileMenuOpen]);

  /* -------------------------------------------------
     PRODUCT SEARCH (DESKTOP)
  ------------------------------------------------- */
  useEffect(() => {
    const term = searchValue.trim();
    if (!term) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/public/products/search?q=${encodeURIComponent(term)}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const json = await res.json();
        setSearchResults(Array.isArray(json.products) ? json.products : []);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setSearchResults([]);
        }
      }
    }, 200);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedDesktop = desktopSearchRef.current?.contains(target);
      const clickedMobile = mobileSearchRef.current?.contains(target);
      if (!clickedDesktop && !clickedMobile) {
        setSearchOpen(false);
        setMobileSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* -------------------------------------------------
     AUTH BOOTSTRAP (FIXED + TYPED)
  ------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    async function hydrateUser(user: User | null) {
      if (!mounted) return;

      setUserEmail(user?.email ?? null);

      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin(profile?.role === "admin");
    }

    // 1️⃣ INITIAL SESSION LOAD
    supabase.auth.getSession().then(
      ({ data }: { data: { session: Session | null } }) => {
        if (!mounted) return;
        hydrateUser(data.session?.user ?? null);
      }
    );

    // 2️⃣ LIVE AUTH CHANGES
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        hydrateUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <>
      {/* ================= TOP HEADER ================= */}
      <div className="border-b border-black bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="font-semibold text-2xl tracking-wide">
            BELLOS
          </Link>

          {/* Search (desktop only) */}
          <div
            className="hidden md:flex flex-1 mx-4 relative"
            ref={desktopSearchRef}
          >
            <input
              placeholder="Search for tiles..."
              className="w-full border border-white/30 bg-white/10 rounded-md px-4 py-2 text-sm"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const first = searchResults[0];
                  if (first) {
                    router.push(`/products/${first.slug ?? first.id}`);
                    setSearchOpen(false);
                  }
                }
              }}
            />

            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white text-black rounded-md shadow-lg border border-black/10 z-50 overflow-hidden">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug ?? product.id}`}
                    className="block w-full px-4 py-3 text-sm bg-white hover:bg-neutral-100 border-b border-black/10 last:border-b-0"
                    onClick={() => setSearchOpen(false)}
                  >
                    <div className="font-medium">
                      {product.title ?? "Untitled tile"}
                    </div>
                    {product.dimension_string && (
                      <div className="text-xs text-neutral-600">
                        {product.dimension_string}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
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
                className="hidden md:inline text-sm font-medium"
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

            <button
              onClick={() => setMobileSearchOpen((open) => !open)}
              className="md:hidden"
              aria-label="Toggle search"
            >
              <FiSearch size={22} />
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden"
              aria-label="Open menu"
            >
              <FiMenu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* (rest of your JSX remains unchanged) */}

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        redirectTo="/"
      />
    </>
  );
}
