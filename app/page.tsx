import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* ---------------------------------------------
   TYPES
--------------------------------------------- */
type ProductListItem = {
  id: string;
  title: string | null;
  slug: string | null;
  price_per_m2: number | string | null;
  price_per_box: number | string | null;
  product_images:
    | {
        url: string | null;
        sort_order?: number | null;
      }[]
    | null;
};

/* ---------------------------------------------
   PRICE FORMATTER
--------------------------------------------- */
const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function formatPrice(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return currencyFormatter.format(num);
}

type CategoryFilter = Record<string, string>;

function buildCategoryHref(slug: string, filters?: CategoryFilter) {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `/category/${slug}?${query}` : `/category/${slug}`;
}

const quickCategoriesData = [
  {
    label: "Floor",
    image: "/quick-1.webp",
    slug: "floor",
    filters: { application: "Floor" },
  },
  {
    label: "Outdoor",
    image: "/quick-2.webp",
    slug: "outdoor",
    filters: { indoor_outdoor: "Outdoor" },
  },
  {
    label: "Commercial",
    image: "/quick-3.webp",
    slug: "commercial",
    filters: { suitable_room: "Commercial" },
  },
  {
    label: "Bathroom",
    image: "/quick-4.webp",
    slug: "bathroom",
    filters: { suitable_room: "Bathroom" },
  },
] as const;

/* ---------------------------------------------
   DATA — with featured-products support
--------------------------------------------- */
async function getHomepageProducts(): Promise<ProductListItem[]> {
  const admin = supabaseAdmin();

  // Try to read featured product IDs from site_settings
  try {
    const { data: setting } = await admin
      .from("site_settings")
      .select("value")
      .eq("key", "homepage_featured_product_ids")
      .maybeSingle();

    const ids: string[] = Array.isArray(setting?.value) ? setting.value : [];

    if (ids.length > 0) {
      const { data } = await admin
        .from("products")
        .select(
          `
          id,
          title,
          slug,
          price_per_m2,
          price_per_box,
          product_images (
            url:image_url,
            sort_order
          )
        `
        )
        .in("id", ids)
        .eq("status", "active");

      if (data && data.length > 0) {
        // Preserve admin-selected order
        const sorted = ids
          .map((id) => data.find((p) => p.id === id))
          .filter(Boolean) as ProductListItem[];
        return sorted.slice(0, 4);
      }
    }
  } catch {
    // site_settings table may not exist yet — fall through
  }

  // Fallback: latest 4 active products
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("products")
    .select(
      `
      id,
      title,
      slug,
      price_per_m2,
      price_per_box,
      product_images (
        url:image_url,
        sort_order
      )
    `
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(4);

  return data ?? [];
}

export const revalidate = 0;

/* ---------------------------------------------
   HOME
--------------------------------------------- */
export default async function Home() {
  const products = await getHomepageProducts();

  return (
    <main className="bg-[#FAFAF8]">
      {/* ====================================================
          HERO
      ==================================================== */}
      <section className="relative w-full h-[100svh] min-h-[560px] max-h-[960px] overflow-hidden">
        <Image
          src="/hero-bathroom.webp"
          alt="Luxury bathroom tiles by Bellos Bespoke Tiles"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

        {/* centred editorial text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-xs sm:text-sm tracking-[0.35em] uppercase mb-5 text-white/70">
            Bespoke Tiles
          </p>
          <div className="w-12 h-px bg-white/40 mb-5" />
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-thin tracking-widest leading-none uppercase">
            Bellos
          </h1>
          <div className="w-12 h-px bg-white/40 mt-5 mb-8" />
          <p className="text-sm sm:text-base text-white/80 max-w-sm">
            Premium tiles for every space, expertly curated
          </p>
          <Link
            href="/tiles"
            className="mt-8 inline-flex items-center gap-2 border border-white/50 bg-white/10 backdrop-blur-sm px-8 py-3 text-sm tracking-widest uppercase hover:bg-white/20 transition-all duration-300"
          >
            Shop Now
          </Link>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-px h-8 bg-white/30" />
        </div>
      </section>

      {/* ====================================================
          CATEGORIES — editorial tile grid
      ==================================================== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 mt-16 sm:mt-24">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-8 h-px bg-[#9A7A5E]" />
          <p className="text-[11px] tracking-[0.35em] uppercase text-[#9A7A5E]">
            Explore Collections
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 grid-rows-2 gap-3 h-[520px] sm:h-[600px]">
          {/* Wall — large left tile, spans 2 cols × 2 rows */}
          <Link
            href={buildCategoryHref("wall", { application: "Wall" })}
            className="group relative col-span-2 row-span-2 overflow-hidden"
          >
            <Image
              src="/homepage-lounge.webp"
              alt="Wall Tiles"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-500" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <span className="text-[10px] tracking-[0.3em] uppercase text-white/60 mb-1">
                Collection
              </span>
              <span className="text-white text-2xl sm:text-3xl font-light tracking-wider">
                Wall
              </span>
            </div>
          </Link>

          {/* 4 small tiles — right side, 4 cols × 1 row each */}
          {quickCategoriesData.map((cat) => (
            <Link
              key={cat.label}
              href={buildCategoryHref(cat.slug, cat.filters)}
              className="group relative col-span-1 overflow-hidden"
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 17vw"
              />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors duration-500" />
              <div className="absolute inset-0 flex items-end p-4">
                <span className="text-white text-sm sm:text-base font-light tracking-wide">
                  {cat.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ====================================================
          LATEST PRODUCTS — 4-column premium grid
      ==================================================== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 mt-20 sm:mt-28">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-8 h-px bg-[#9A7A5E]" />
            <p className="text-[11px] tracking-[0.35em] uppercase text-[#9A7A5E]">
              Latest Products
            </p>
          </div>
          <Link
            href="/tiles"
            className="text-xs tracking-widest uppercase text-[#1A1A1A] border-b border-[#1A1A1A]/30 pb-0.5 hover:border-[#1A1A1A] transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => {
            const sorted = [...(product.product_images ?? [])].sort(
              (a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99)
            );
            const img = sorted[0]?.url ?? "/hero-bathroom.webp";
            const price =
              formatPrice(product.price_per_m2) ??
              formatPrice(product.price_per_box) ??
              "Contact for pricing";

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug ?? product.id}`}
                className="group block"
              >
                {/* image container */}
                <div className="relative w-full overflow-hidden bg-[#EEECE9]" style={{ aspectRatio: "4/5" }}>
                  <Image
                    src={img}
                    alt={product.title ?? ""}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>

                {/* details */}
                <div className="mt-3 px-0.5">
                  <p className="text-[#1A1A1A] text-sm sm:text-base font-light leading-snug tracking-wide">
                    {product.title}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-[#9A7A5E] tracking-wide">
                    {price}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ====================================================
          BRAND STORY
      ==================================================== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 mt-20 sm:mt-28">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* image */}
          <div className="relative h-[320px] sm:h-[440px] overflow-hidden">
            <Image
              src="/bellos-intro-logo.webp"
              alt="Bellos Brand"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* text */}
          <div className="bg-[#151515] text-white flex flex-col justify-center px-10 py-14 sm:px-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-[#9A7A5E]" />
              <p className="text-[11px] tracking-[0.35em] uppercase text-[#9A7A5E]">
                Our Story
              </p>
            </div>
            <h2 className="text-3xl sm:text-4xl font-thin tracking-wider leading-tight mb-6">
              Premium Tiles
              <br />
              <span className="italic text-white/60">for Every Space</span>
            </h2>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-sm">
              At Bellos, we provide high-quality porcelain, ceramic, mosaic and
              outdoor tiles — carefully curated for discerning homes and
              commercial spaces. Explore our collections or try our 3D
              Visualiser to see your space come to life.
            </p>
            <Link
              href="/about"
              className="mt-10 inline-flex items-center gap-3 text-xs tracking-widest uppercase text-white/80 hover:text-white transition-colors group w-fit"
            >
              Learn More
              <span className="w-6 h-px bg-white/40 group-hover:w-10 transition-all duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================
          VISUALISER CTA
      ==================================================== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 mt-20 sm:mt-28 mb-20 sm:mb-28">
        <div className="relative overflow-hidden h-[300px] sm:h-[420px]">
          <Image
            src="/visualiser-banner.webp"
            alt="Try our 3D Visualiser"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-white/40" />
              <p className="text-[11px] tracking-[0.35em] uppercase text-white/60">
                Interactive Tool
              </p>
              <div className="w-8 h-px bg-white/40" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-thin tracking-widest uppercase mb-4">
              Try Tiles in 3D
            </h2>
            <p className="text-sm sm:text-base text-white/70 mb-8 max-w-sm">
              Visualise our tiles in real room settings before you buy
            </p>
            <Link
              href="/visualiser"
              className="border border-white/60 bg-white/10 backdrop-blur-sm px-10 py-3 text-xs tracking-widest uppercase hover:bg-white/20 transition-all duration-300"
            >
              Open Visualiser
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
