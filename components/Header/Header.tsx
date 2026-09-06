"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

const NAV_LINKS = [
  { href: "/tiles", label: "All Tiles" },
  { href: "/offers", label: "Offers" },
  { href: "/visualiser", label: "Visualiser", prefetch: false },
  { href: "/wood-planks", label: "Wood Planks" },
  { href: "/installation-products", label: "Installation" },
  { href: "/faqs", label: "FAQs" },
  { href: "/about", label: "About" },
  { href: "/contact-us", label: "Contact" },
];

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
     AUTH BOOTSTRAP
  ------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    async function hydrateUser(user: User | null) {
      if (!mounted) return;
      setUserEmail(user?.email ?? null);
      if (!user) { setIsAdmin(false); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setIsAdmin(profile?.role === "admin");
    }

    supabase.auth.getSession().then(
      ({ data }: { data: { session: Session | null } }) => {
        hydrateUser(data.session?.user ?? null);
      }
    );

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
      {/* ===== MAIN HEADER BAR ===== */}
      <header className="bg-[#1A1A1A] text-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center">
            <Image
              src="/bellos_logo_new_white.webp"
              alt="Bellos"
              width={120}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 flex-1 justify-center">
            {NAV_LINKS.map(({ href, label, prefetch }) => (
              <Link
                key={href}
                href={href}
                prefetch={prefetch}
                className="text-[10px] tracking-[0.25em] uppercase text-white/60 hover:text-white transition-colors duration-200 whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] hover:text-white transition-colors duration-200"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-5 shrink-0">

            {/* Desktop search */}
            <div className="hidden md:block relative" ref={desktopSearchRef}>
              <div className="relative">
                <input
                  placeholder="Search tiles..."
                  className="w-48 lg:w-60 border-0 border-b border-white/20 bg-transparent pb-1.5 pt-1 pr-6 text-sm focus:outline-none focus:border-white/50 transition-colors placeholder-white/30 text-white/80"
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
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                  <FiSearch size={13} />
                </span>
              </div>

              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 z-50 shadow-2xl">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug ?? product.id}`}
                      className="block px-4 py-3 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
                      onClick={() => setSearchOpen(false)}
                    >
                      <div className="text-xs font-light text-white tracking-wide">
                        {product.title ?? "Untitled tile"}
                      </div>
                      {product.dimension_string && (
                        <div className="text-[10px] tracking-widest uppercase text-[#9A7A5E] mt-0.5">
                          {product.dimension_string}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Auth — desktop */}
            {userEmail ? (
              <Link
                href="/account"
                className="hidden md:flex items-center gap-2"
                title={userEmail}
              >
                <span className="h-7 w-7 border border-white/20 flex items-center justify-center text-[10px] tracking-widest uppercase text-white/60 hover:text-white hover:border-white/40 transition-colors">
                  {userEmail[0].toUpperCase()}
                </span>
              </Link>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="hidden md:inline text-[10px] tracking-[0.25em] uppercase text-white/60 hover:text-white transition-colors duration-200"
              >
                Login
              </button>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative flex items-center">
              <FiShoppingCart size={20} className="text-white/70 hover:text-white transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-[#9A7A5E] text-[9px] w-4 h-4 flex items-center justify-center text-white font-medium">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile search toggle */}
            <button
              onClick={() => setMobileSearchOpen((o) => !o)}
              className="md:hidden text-white/70 hover:text-white transition-colors"
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-white/70 hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <FiMenu size={22} />
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <div
            className="md:hidden border-t border-white/10 px-6 py-4"
            ref={mobileSearchRef}
          >
            <div className="relative">
              <input
                autoFocus
                placeholder="Search tiles..."
                className="w-full border-0 border-b border-white/20 bg-transparent pb-2 pt-1 pr-6 text-sm focus:outline-none focus:border-white/50 transition-colors placeholder-white/30 text-white"
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
              <span className="absolute right-0 bottom-2.5 text-white/30 pointer-events-none">
                <FiSearch size={13} />
              </span>
            </div>

            {searchOpen && searchResults.length > 0 && (
              <div className="mt-2 border border-white/10 bg-[#111]">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug ?? product.id}`}
                    className="block px-4 py-3 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
                    onClick={() => {
                      setSearchOpen(false);
                      setMobileSearchOpen(false);
                    }}
                  >
                    <div className="text-xs font-light text-white tracking-wide">
                      {product.title ?? "Untitled tile"}
                    </div>
                    {product.dimension_string && (
                      <div className="text-[10px] tracking-widest uppercase text-[#9A7A5E] mt-0.5">
                        {product.dimension_string}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* ===== MOBILE MENU OVERLAY ===== */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* ===== MOBILE MENU PANEL ===== */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm bg-[#1A1A1A] text-white transform transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Image
            src="/bellos_logo_new_white.webp"
            alt="Bellos"
            width={100}
            height={30}
            className="h-7 w-auto object-contain"
          />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col px-6 py-6 gap-0">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="py-4 border-b border-white/10 text-[10px] tracking-[0.3em] uppercase text-white/60 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="py-4 border-b border-white/10 text-[10px] tracking-[0.3em] uppercase text-[#9A7A5E] hover:text-white transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Auth */}
        <div className="px-6 py-6 border-t border-white/10 mt-auto">
          {userEmail ? (
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[10px] tracking-[0.3em] uppercase text-white/60 hover:text-white transition-colors"
            >
              Account
            </Link>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthOpen(true);
              }}
              className="text-[10px] tracking-[0.3em] uppercase text-white/60 hover:text-white transition-colors"
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
