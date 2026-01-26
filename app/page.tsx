import Image from "next/image";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

/* ---------------------------------------------
   PRODUCT TYPE
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
   FETCH LATEST FEATURED PRODUCTS
--------------------------------------------- */
async function getFeaturedProducts(): Promise<ProductListItem[]> {
  const supabase = supabaseServer();

  const { data, error } = await supabase
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
    .eq("status", "active") // only show active products
    .order("created_at", { ascending: false })
    .limit(2);

  if (error) {
    console.error("Failed to load products", error);
    return [];
  }

  return data ?? [];
}

export const revalidate = 0;

/* ---------------------------------------------
   HOME PAGE
--------------------------------------------- */
export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <main>
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4">

          {/* ================= HERO BANNER ================= */}
          <section className="mt-6">
            <div className="w-full h-[720px] relative overflow-hidden">
              <Image
                src="/hero-home-bellos-bathroom.webp"
                alt="Hero Banner"
                fill
                className="object-cover"
                loading="eager"
                sizes="100vw"
              />
            </div>
          </section>

          {/* ================= QUICK CATEGORY GRID ================= */}
          <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href={buildCategoryHref("wall", { application: "Wall" })}
              className="relative h-[400px] overflow-hidden block"
            >
              <Image
                src="/homepage-lounge.webp"
                alt="Lounge Tile Scene"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute bottom-4 left-4 bg-white/75 px-4 py-2 text-[#1a1a1a]">
                Wall
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-4">
              {quickCategoriesData.map((cat) => (
                <Link
                  key={cat.label}
                  href={buildCategoryHref(cat.slug, cat.filters)}
                  className="relative h-[190px] overflow-hidden block"
                >
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/75 px-3 py-1 text-sm font-light text-[#1a1a1a]">
                    {cat.label}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ================= INTRO SECTION ================= */}
          <section className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="relative w-full h-[380px] overflow-hidden">
              <Image
                src="/bellos-intro-logo.webp"
                alt="Bellos Bespoke Tiles Logo"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="bg-[#1c1c1c] p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Premium Tiles for Every Space</h2>
              <p className="leading-relaxed text-white/80">
                At Bellos, we provide high-quality porcelain, ceramic, mosaic, and 
                outdoor tiles to elevate your interiors. Explore our collections and 
                experience our state-of-the-art 3D Visualiser to see your dream space 
                come to life.
              </p>

              <Link
                href="/about"
                className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                Learn More
              </Link>
            </div>
          </section>
        </div>
      </div>

      <div className="bg-white text-[#1c1c1c]">
        <div className="max-w-7xl mx-auto px-4">

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="mt-24 pt-10">
        <div className="flex items-center justify-between gap-4">
          <div className="text-[#313131]">
            <h2 className="text-2xl font-medium">
              Latest Products
            </h2>
            <p className="text-[#333333]">View Our Latest Ranges</p>
          </div>

        </div>

        {products.length === 0 ? (
          <p className="mt-6 text-[#333333]">No products to show yet. Check back soon.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {products.map((product) => {
              const sortedImages = [...(product.product_images ?? [])].sort(
                (a, b) => (a?.sort_order ?? 999) - (b?.sort_order ?? 999)
              );

              // Correct field: url
              const firstImage = sortedImages[0]?.url || "/hero-bathroom.webp";

              const isLocal = firstImage.startsWith("/");

              const pricePerM2 = formatPrice(product.price_per_m2);
              const pricePerBox = formatPrice(product.price_per_box);

              const priceLabel =
                pricePerM2 ??
                (pricePerBox ? `${pricePerBox} / box` : "Contact for pricing");

              const slug = product.slug || product.id;

              return (
                <Link
                  key={product.id}
                  href={`/products/${slug}`}
                  className="group border border-gray-200 rounded-none p-4 shadow-sm transition hover:shadow-lg"
                >
                  <div className="relative w-full overflow-hidden bg-neutral-100 pb-[70%]">
                    <Image
                      src={firstImage}
                      alt={product.title ?? "Product image"}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      unoptimized={!isLocal}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>

                  <div className="mt-4">
                    <p className="text-lg font-semibold text-[#1c1c1c]">
                      {product.title ?? "Untitled product"}
                    </p>
                    <p className="text-sm text-[#333333]">{priceLabel}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= VISUALISER ================= */}
      <section className="mt-24 relative h-[300px] overflow-hidden">
        <Image
          src="/visualiser-banner.webp"
          alt="Tile Visualiser"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
          <h2 className="text-3xl font-bold mb-3">Try Tiles in 3D</h2>
          <p className="mb-5 text-lg">View tiles in realistic room models</p>

          <Link
            href="/visualiser"
            className="bg-white text-neutral-900 px-6 py-3 rounded-lg font-semibold"
          >
            Open Visualiser
          </Link>
        </div>
      </section>
      <div className="h-24 bg-white" />

        </div>
      </div>

    </main>
  );
}
