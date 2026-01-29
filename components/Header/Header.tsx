"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMenu, FiSearch, FiX, FiShoppingCart } from "react-icons/fi";
import { useCart } from "@/app/context/CartContext";
import AuthModal from "@/components/auth/AuthModal";
import { supabaseBrowser } from "@/lib/supabase/client";

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <div className="hidden md:flex flex-1 mx-4 relative" ref={desktopSearchRef}>
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
                    className="block w-full px-4 py-3 text-sm text-left no-underline bg-white hover:bg-neutral-100 border-b border-black/10 last:border-b-0"
                    onClick={() => {
                      setSearchOpen(false);
                    }}
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

            {/* Mobile search button */}
            <button
              onClick={() => setMobileSearchOpen((open) => !open)}
              className="md:hidden"
              aria-label="Toggle search"
            >
              <FiSearch size={22} />
            </button>

            {/* Mobile menu button */}
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

      {/* ================= MOBILE SEARCH ================= */}
      <div className={`md:hidden ${mobileSearchOpen ? "block" : "hidden"}`}>
        <div className="border-b border-black bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="relative" ref={mobileSearchRef}>
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
                      setMobileSearchOpen(false);
                    }
                  }
                }}
              />

              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white text-black rounded-md shadow-lg border border-black/10 z-50 divide-y divide-black/10 overflow-hidden">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug ?? product.id}`}
                      className="block w-full px-4 py-3 text-sm text-left no-underline bg-white hover:bg-neutral-100 border-b border-black/10 last:border-b-0"
                      onClick={() => {
                        setSearchOpen(false);
                        setMobileSearchOpen(false);
                      }}
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
          </div>
        </div>
      </div>

      {/* ================= DESKTOP NAV ================= */}
      <nav className="hidden md:block border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 py-3">
          <Link href="/" className="text-neutral-600 font-light hover:text-neutral-800">
            Home
          </Link>

          <Link
            href="/visualiser"
            prefetch={false}
            className="text-neutral-600 font-light hover:text-neutral-800"
          >
            Tile Visualiser
          </Link>

          <Link
            href="/wood-planks"
            className="text-neutral-600 font-light hover:text-neutral-800"
          >
            Wood Planks
          </Link>

          <Link href="/installation-products" className="text-neutral-600 font-light hover:text-neutral-800">
            Installation Products
          </Link>

          <Link href="/faqs" className="text-neutral-600 font-light hover:text-neutral-800">
            FAQs
          </Link>

          <Link href="/about" className="text-neutral-600 font-light hover:text-neutral-800">
            About
          </Link>

          <Link href="/contact-us" className="text-neutral-600 font-light hover:text-neutral-800">
            Contact
          </Link>

          {isAdmin && (
            <Link href="/admin" className="text-neutral-600 font-light hover:text-neutral-800">
              Admin
            </Link>
          )}
        </div>
      </nav>

      {/* ================= MOBILE MENU ================= */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b text-neutral-700">
          <span className="font-semibold text-lg">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-neutral-700 hover:text-neutral-900"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Links */}
        <nav className="flex flex-col px-5 py-6 space-y-5 text-sm [&_a]:text-neutral-700 [&_a]:hover:text-neutral-900 [&_button]:text-neutral-700 [&_button]:hover:text-neutral-900">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/visualiser" prefetch={false} onClick={() => setMobileMenuOpen(false)}>
            Tile Visualiser
          </Link>
          <Link href="/wood-planks" onClick={() => setMobileMenuOpen(false)}>
            Wood Planks
          </Link>
          <Link href="/category/wall" onClick={() => setMobileMenuOpen(false)}>
            Wall
          </Link>
          <Link href="/category/floor" onClick={() => setMobileMenuOpen(false)}>
            Floor
          </Link>
          <Link href="/category/outdoor" onClick={() => setMobileMenuOpen(false)}>
            Outdoor
          </Link>
          <Link href="/category/commercial" onClick={() => setMobileMenuOpen(false)}>
            Commercial
          </Link>
          <Link href="/category/bathroom" onClick={() => setMobileMenuOpen(false)}>
            Bathroom
          </Link>
          <Link href="/installation-products" onClick={() => setMobileMenuOpen(false)}>
            Installation Products
          </Link>
          <Link href="/faqs" onClick={() => setMobileMenuOpen(false)}>FAQs</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link href="/contact-us" onClick={() => setMobileMenuOpen(false)}>Contact</Link>

          {isAdmin && (
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
              Admin
            </Link>
          )}
        </nav>

        <div className="border-t px-5 py-4 text-neutral-700">
          {userEmail ? (
            <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
              Account
            </Link>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthOpen(true);
              }}
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        redirectTo="/"
      />
    </>
  );
}
