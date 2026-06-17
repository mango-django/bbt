import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Regenerate the sitemap hourly so new products appear without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // -------- Static pages --------
  const staticPaths: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, freq: "weekly" },
    { path: "/tiles", priority: 0.9, freq: "weekly" },
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
    const [products, categories, planks] = await Promise.all([
      admin.from("products").select("slug, updated_at").eq("status", "active"),
      admin.from("categories").select("slug"),
      admin.from("wood_planks").select("slug"),
    ]);

    const productEntries: MetadataRoute.Sitemap = (products.data ?? [])
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

    dynamicEntries = [...categoryEntries, ...productEntries, ...plankEntries];
  } catch (err) {
    // Never let a DB hiccup break the sitemap — return the static pages.
    console.error("sitemap: failed to load dynamic entries", err);
  }

  return [...staticEntries, ...dynamicEntries];
}
