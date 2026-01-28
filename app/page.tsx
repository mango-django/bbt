import Image from "next/image";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

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
   DATA
--------------------------------------------- */
async function getFeaturedProducts(): Promise<ProductListItem[]> {
  const supabase = supabaseServer();

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
    .limit(2);

  return data ?? [];
}

export const revalidate = 0;

/* ---------------------------------------------
   HOME
--------------------------------------------- */
export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <main>
      {/* ================= HERO ================= */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4">
          <section className="mt-4">
            <div className="relative w-full h-[420px] sm:h-[520px] lg:h-[720px] overflow-hidden">
              <Image
                src="/hero-home-bellos-bathroom.webp"
                alt="Hero Banner"
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </section>

          {/* ================= QUICK CATEGORIES ================= */}
          <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href={buildCategoryHref("wall", { application: "Wall" })}
              className="relative h-[260px] sm:h-[360px] md:h-[400px] overflow-hidden"
            >
              <Image
                src="/homepage-lounge.webp"
                alt="Wall Tiles"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-white/80 px-4 py-2 text-black text-sm sm:text-base">
                Wall
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-4">
              {quickCategoriesData.map((cat) => (
                <Link
                  key={cat.label}
                  href={buildCategoryHref(cat.slug, cat.filters)}
                  className="relative h-[140px] sm:h-[180px] overflow-hidden"
                >
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/80 px-3 py-1 text-xs sm:text-sm text-black">
                    {cat.label}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ================= INTRO ================= */}
          <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative w-full h-[260px] sm:h-[340px] overflow-hidden">
              <Image
                src="/bellos-intro-logo.webp"
                alt="Bellos Logo"
                fill
                className="object-cover"
              />
            </div>

            <div className="bg-[#1c1c1c] p-6 sm:p-8 text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Premium Tiles for Every Space
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                At Bellos, we provide high-quality porcelain, ceramic, mosaic and
                outdoor tiles. Explore our collections or try our 3D Visualiser
                to see your space come to life.
              </p>

              <Link
                href="/about"
                className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-sm sm:text-base"
              >
                Learn More
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* ================= FEATURED ================= */}
      <div className="bg-white text-black">
        <div className="max-w-7xl mx-auto px-4">
          <section className="mt-20">
            <h2 className="text-xl sm:text-2xl font-medium mb-6">
              Latest Products
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => {
                const img =
                  product.product_images?.[0]?.url ?? "/hero-bathroom.webp";
                const price =
                  formatPrice(product.price_per_m2) ??
                  formatPrice(product.price_per_box) ??
                  "Contact for pricing";

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug ?? product.id}`}
                    className="border p-4 hover:shadow-lg transition"
                  >
                    <div className="relative w-full pb-[70%] bg-neutral-100">
                      <Image src={img} alt="" fill className="object-cover" />
                    </div>
                    <div className="mt-4">
                      <p className="font-semibold">{product.title}</p>
                      <p className="text-sm text-gray-600">{price}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ================= VISUALISER CTA ================= */}
          <section className="mt-20 relative h[240px] sm:h-[300px] overflow-hidden">
            <Image
              src="/visualiser-banner.webp"
              alt="Visualiser"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center px-4">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Try Tiles in 3D
              </h2>
              <p className="text-sm sm:text-lg mb-5">
                Visualise tiles in real room settings
              </p>
              <Link
                href="/visualiser"
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold"
              >
                Open Visualiser
              </Link>
            </div>
          </section>

          <div className="h-20" />
        </div>
      </div>
    </main>
  );
}
