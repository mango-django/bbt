import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Regenerate the sitemap hourly so new products appear without a redeploy.
export const revalidate = 3600;

// Supabase caps a single query at 1000 rows — page through so large tables
// (products) never silently truncate the sitemap.
async function fetchAllRows<T>(
  query: (from: number, to: number) => PromiseLike<{ data: T[] | null }>
): Promise<T[]> {
  const PAGE = 1000;
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data } = await query(from, from + PAGE - 1);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // -------- Static pages --------
  const staticPaths: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, freq: "weekly" },
    { path: "/tiles", priority: 0.9, freq: "weekly" },
    { path: "/wood-planks", priority: 0.8, freq: "weekly" },
    { path: "/installation-products", priority: 0.8, freq: "weekly" },
    { path: "/visualiser", priority: 0.8, freq: "monthly" },
    { path: "/about", priority: 0.5, freq: "yearly" },
    { path: "/contact-us", priority: 0.5, freq: "yearly" },
    { path: "/faqs", priority: 0.5, freq: "monthly" },
    { path: "/delivery-returns", priority: 0.4, freq: "yearly" },
    { path: "/terms-and-conditions", priority: 0.3, freq: "yearly" },
    { path: "/privacy-policy", priority: 0.3, freq: "yearly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));

  // -------- Dynamic content --------
  let dynamicEntries: MetadataRoute.Sitemap = [];

  try {
    const admin = supabaseAdmin();
    const [productRows, categories, planks, installs] = await Promise.all([
      fetchAllRows((from, to) =>
        admin
          .from("products")
          .select("slug, updated_at")
          .eq("status", "active")
          .order("id")
          .range(from, to)
      ),
      admin.from("categories").select("slug"),
      admin.from("wood_planks").select("slug").eq("is_active", true),
      admin.from("installation_products").select("id").ilike("status", "active"),
    ]);

    const productEntries: MetadataRoute.Sitemap = productRows
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${SITE_URL}/products/${encodeURIComponent(p.slug as string)}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    const categoryEntries: MetadataRoute.Sitemap = (categories.data ?? [])
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${SITE_URL}/category/${encodeURIComponent(c.slug as string)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    const plankEntries: MetadataRoute.Sitemap = (planks.data ?? [])
      .filter((w) => w.slug)
      .map((w) => ({
        url: `${SITE_URL}/wood-planks/${encodeURIComponent(w.slug as string)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    const installEntries: MetadataRoute.Sitemap = (installs.data ?? [])
      .filter((i) => i.id)
      .map((i) => ({
        url: `${SITE_URL}/installation-products/${encodeURIComponent(i.id as string)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      }));

    dynamicEntries = [
      ...categoryEntries,
      ...productEntries,
      ...plankEntries,
      ...installEntries,
    ];
  } catch (err) {
    // Never let a DB hiccup break the sitemap — return the static pages.
    console.error("sitemap: failed to load dynamic entries", err);
  }

  return [...staticEntries, ...dynamicEntries];
}
