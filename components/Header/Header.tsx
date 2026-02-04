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

/* -------------------------------------------------
   TYPES
------------------------------------------------- */
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
     PRODUCT SEARCH
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
        if (err?.name !== "AbortError") setSearchResults([]);
      }
    }, 200);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchValue]);

  /* -------------------------------------------------
     CLOSE SEARCH ON OUTSIDE CLICK
  ------------------------------------------------- */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !desktopSearchRef.current?.contains(target) &&
        !mobileSearchRef.current?.contains(target)
      ) {
        setSearchOpen(false);
        setMobileSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* -------------------------------------------------
     AUTH BOOTSTRAP (PERSISTENT + TYPED)
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

    // Initial load
    supabase.auth.getSession().then(
      ({ data }: { data: { session: Session | null } }) => {
        hydrateUser(data.session?.user ?? null);
      }
    );

    // Live auth updates
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

  /* =================================================
     RENDER
  ================================================= */
  return (
    <>
      {/* ================= TOP HEADER ================= */}
      <div className="border-b border-black bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="font-semibold text-2xl tracking-wide">
            BELLOS
          </Link>

          {/* Desktop Search */}
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-white text-black rounded-md shadow-lg border z-50">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug ?? product.id}`}
                    className="block px-4 py-3 text-sm hover:bg-neutral-100 border-b last:border-b-0"
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

          {/* Right Actions */}
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
              onClick={() => setMobileSearchOpen((o) => !o)}
              className="md:hidden"
            >
              <FiSearch size={22} />
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden"
            >
              <FiMenu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP NAV ================= */}
      <nav className="hidden md:block bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 py-3 text-neutral-600">
          <Link href="/">Home</Link>
          <Link href="/visualiser" prefetch={false}>Tile Visualiser</Link>
          <Link href="/wood-planks">Wood Planks</Link>
          <Link href="/installation-products">Installation Products</Link>
          <Link href="/faqs">FAQs</Link>
          <Link href="/about">About</Link>
          <Link href="/contact-us">Contact</Link>
          {isAdmin && <Link href="/admin">Admin</Link>}
        </div>
      </nav>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden ${
          mobileMenuOpen ? "block" : "hidden"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 z-50 h-full w-[85%] bg-white text-neutral-700 transform transition-transform md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between p-4 border-b">
          <span className="font-semibold">Menu</span>
          <FiX size={24} onClick={() => setMobileMenuOpen(false)} />
        </div>

        <nav className="flex flex-col p-5 gap-4">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/visualiser" onClick={() => setMobileMenuOpen(false)}>Tile Visualiser</Link>
          <Link href="/wood-planks" onClick={() => setMobileMenuOpen(false)}>Wood Planks</Link>
          <Link href="/installation-products" onClick={() => setMobileMenuOpen(false)}>Installation Products</Link>
          <Link href="/faqs" onClick={() => setMobileMenuOpen(false)}>FAQs</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link href="/contact-us" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          {isAdmin && <Link href="/admin">Admin</Link>}
        </nav>

        <div className="border-t p-5">
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
