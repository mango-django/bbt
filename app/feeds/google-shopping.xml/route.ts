// Google Merchant Center product feed (RSS 2.0 + g: namespace).
// Submit https://bellosbespoketiles.co.uk/feeds/google-shopping.xml in
// Merchant Center → Products → Feeds. Regenerated hourly.
//
// Compliance notes:
// - Feed price/availability must match the landing page. Tiles are sold per
//   m² and the page headline price is £/m², so price = price_per_m2 with
//   unit_pricing_measure 1sqm. Wood planks are sold per box.
// - No GTINs/MPNs exist for these ranges, so identifier_exists=no.
// - Items without an image or a positive price are excluded (Google rejects
//   them and repeated rejections hurt feed quality).

import { supabaseAdmin } from "@/lib/supabase/admin";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import {
  feedAvailability,
  shippingRateForWeight,
  stripHtml,
  truncate,
} from "@/lib/seo";

export const revalidate = 3600;

// Supabase caps a single query at 1000 rows — page through so the feed
// never silently truncates the catalogue.
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

const GPC_FLOORING = "Hardware > Building Materials > Flooring & Carpet";
const GPC_WALL_TILE = "Hardware > Building Materials > Wall & Ceiling Tile";

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function tag(name: string, value: unknown): string {
  const v = String(value ?? "").trim();
  return v ? `<${name}>${esc(v)}</${name}>` : "";
}

type FeedItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImages?: string[];
  price: number;
  availability: string;
  brand?: string | null;
  googleProductCategory?: string;
  productType?: string;
  color?: string | null;
  material?: string | null;
  size?: string | null;
  shippingWeightKg?: number | null;
  unitPricingMeasure?: string;
  unitPricingBaseMeasure?: string;
};

function renderItem(item: FeedItem): string {
  const shippingPrice = shippingRateForWeight(item.shippingWeightKg);
  const additional = (item.additionalImages ?? [])
    .slice(0, 10)
    .map((url) => tag("g:additional_image_link", url))
    .join("");

  return `<item>
${tag("g:id", item.id)}
${tag("g:title", truncate(item.title, 150))}
${tag("g:description", truncate(item.description, 4900))}
${tag("g:link", item.link)}
${tag("g:image_link", item.imageLink)}
${additional}
${tag("g:price", `${item.price.toFixed(2)} GBP`)}
${tag("g:availability", item.availability)}
${tag("g:condition", "new")}
${item.brand ? tag("g:brand", item.brand) : ""}
${tag("g:identifier_exists", "no")}
${item.googleProductCategory ? tag("g:google_product_category", item.googleProductCategory) : ""}
${item.productType ? tag("g:product_type", item.productType) : ""}
${item.color ? tag("g:color", truncate(item.color, 100)) : ""}
${item.material ? tag("g:material", item.material) : ""}
${item.size ? tag("g:size", item.size) : ""}
${item.shippingWeightKg ? tag("g:shipping_weight", `${item.shippingWeightKg} kg`) : ""}
${
  shippingPrice != null
    ? `<g:shipping>${tag("g:country", "GB")}${tag("g:service", "Standard delivery")}${tag(
        "g:price",
        `${shippingPrice.toFixed(2)} GBP`
      )}</g:shipping>`
    : ""
}
${item.unitPricingMeasure ? tag("g:unit_pricing_measure", item.unitPricingMeasure) : ""}
${item.unitPricingBaseMeasure ? tag("g:unit_pricing_base_measure", item.unitPricingBaseMeasure) : ""}
</item>`;
}

export async function GET() {
  const admin = supabaseAdmin();

  const [products, categoriesRes, planks, installs] = await Promise.all([
    fetchAllRows((from, to) =>
      admin
        .from("products")
        .select(
          `id, title, slug, description, brand, material, finish, color, application,
           dimension_string, price_per_m2, price_per_tile, boxes_in_stock,
           box_weight_kg, category_ids, display_id,
           product_images (image_url, sort_order)`
        )
        .eq("status", "active")
        .order("id")
        .range(from, to)
    ),
    admin.from("categories").select("id, name"),
    fetchAllRows((from, to) =>
      admin.from("wood_planks").select("*").eq("is_active", true).order("id").range(from, to)
    ),
    fetchAllRows((from, to) =>
      admin
        .from("installation_products")
        .select("*, installation_product_images (url, sort_order)")
        .ilike("status", "active")
        .order("id")
        .range(from, to)
    ),
  ]);

  const categoryName = new Map<string, string>(
    (categoriesRes.data ?? []).map((c) => [c.id as string, c.name as string])
  );

  const items: FeedItem[] = [];

  /* ---------------- Tiles ---------------- */
  for (const p of products) {
    const images = (p.product_images ?? [])
      .slice()
      .sort(
        (a: { sort_order?: number }, b: { sort_order?: number }) =>
          (a.sort_order ?? 999) - (b.sort_order ?? 999)
      )
      .map((img: { image_url?: string }) => img.image_url)
      .filter(Boolean) as string[];

    const price = Number(p.price_per_m2) || Number(p.price_per_tile) || 0;
    if (!images.length || price <= 0 || !p.slug) continue;

    const applications: string[] = Array.isArray(p.application) ? p.application : [];
    const wallOnly =
      applications.length > 0 &&
      applications.every((a) => String(a).toLowerCase().includes("wall"));

    const colors: string[] = Array.isArray(p.color) ? p.color : p.color ? [p.color] : [];
    const primaryCategory = (p.category_ids ?? [])
      .map((id: string) => categoryName.get(id))
      .filter(Boolean)[0];

    const titleParts = [p.title];
    if (p.dimension_string && !String(p.title).includes(p.dimension_string)) {
      titleParts.push(p.dimension_string);
    }
    if (p.material && !String(p.title).toLowerCase().includes(String(p.material).toLowerCase())) {
      titleParts.push(`${p.material} Tiles`);
    } else {
      titleParts.push("Tiles");
    }

    const soldPerM2 = Number(p.price_per_m2) > 0;

    items.push({
      id: `tile-${p.id}`,
      title: titleParts.join(" | "),
      description:
        stripHtml(String(p.description ?? "")) ||
        `${p.title} from ${SITE_NAME}. Premium tiles delivered across the UK.`,
      link: `${SITE_URL}/products/${encodeURIComponent(p.slug)}`,
      imageLink: images[0],
      additionalImages: images.slice(1),
      price,
      availability: feedAvailability(p.boxes_in_stock),
      brand: p.brand,
      googleProductCategory: wallOnly ? GPC_WALL_TILE : GPC_FLOORING,
      productType: primaryCategory ? `Tiles > ${primaryCategory}` : "Tiles",
      color: colors.slice(0, 3).join("/"),
      material: p.material,
      size: p.dimension_string,
      shippingWeightKg: Number(p.box_weight_kg) || null,
      ...(soldPerM2
        ? { unitPricingMeasure: "1sqm", unitPricingBaseMeasure: "1sqm" }
        : {}),
    });
  }

  /* ---------------- Wood planks ---------------- */
  for (const w of planks) {
    const images: string[] = Array.isArray(w.images) ? w.images.filter(Boolean) : [];
    const price = Number(w.price_per_box) || 0;
    if (!images.length || price <= 0 || !w.slug) continue;

    const coverage = Number(w.coverage_per_box) || 0;

    items.push({
      id: `wood-${w.id}`,
      title: `${w.title} | Wood Effect Planks`,
      description:
        stripHtml(String(w.description ?? "")) ||
        `${w.title} wood-effect planks from ${SITE_NAME}.`,
      link: `${SITE_URL}/wood-planks/${encodeURIComponent(w.slug)}`,
      imageLink: images[0],
      additionalImages: images.slice(1),
      price,
      availability: "in_stock",
      brand: w.brand,
      googleProductCategory: GPC_FLOORING,
      productType: "Wood Planks",
      material: "Wood Effect",
      shippingWeightKg: Number(w.weight_per_box) || null,
      ...(coverage > 0
        ? { unitPricingMeasure: `${coverage}sqm`, unitPricingBaseMeasure: "1sqm" }
        : {}),
    });
  }

  /* ---------------- Installation products ---------------- */
  for (const ip of installs) {
    const images = (ip.installation_product_images ?? [])
      .slice()
      .sort(
        (a: { sort_order?: number }, b: { sort_order?: number }) =>
          (a.sort_order ?? 999) - (b.sort_order ?? 999)
      )
      .map((img: { url?: string }) => img.url)
      .filter(Boolean) as string[];
    const price = Number(ip.price ?? ip.unit_price ?? ip.unit_amount) || 0;
    if (!images.length || price <= 0) continue;

    items.push({
      id: `install-${ip.id}`,
      title: ip.name,
      description:
        stripHtml(String(ip.description ?? "")) ||
        `${ip.name} — tile installation product from ${SITE_NAME}.`,
      link: `${SITE_URL}/installation-products/${encodeURIComponent(ip.id)}`,
      imageLink: images[0],
      additionalImages: images.slice(1),
      price,
      availability: "in_stock",
      brand: ip.brand,
      productType: ip.product_type
        ? `Installation Products > ${ip.product_type}`
        : "Installation Products",
      color: ip.colour,
      shippingWeightKg: Number(ip.weight_each) || null,
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${esc(SITE_NAME)}</title>
<link>${esc(SITE_URL)}</link>
<description>${esc(SITE_DESCRIPTION)}</description>
${items.map(renderItem).join("\n")}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
