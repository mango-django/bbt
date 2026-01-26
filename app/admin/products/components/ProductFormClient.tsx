"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import ImageUploader from "@/components/admin/ImageUploader";
import { slugify } from "@/lib/slugify";

type Props = {
  mode: "create" | "edit";
  productId: string | null;
};

const safe = (v: any) => (v === null || v === undefined ? "" : String(v));
const arr = (v: any) => (Array.isArray(v) ? v : []);
const num = (v: any) => {
  const parsed = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

function normalize(product: any) {
  if (!product) return {};

  return {
    id: product.id,
    status: product.status ?? "draft",

    title: safe(product.title),
    slug: safe(product.slug),
    description: safe(product.description),

    display_id: safe(product.display_id),
    supplier_id: safe(product.supplier_id),

    category_ids: arr(product.category_ids),

    material: safe(product.material),
    color: arr(product.color),
    finish: arr(product.finish),
    application: arr(product.application),
    suitable_room: arr(product.suitable_room),
    indoor_outdoor: safe(product.indoor_outdoor),

    dimension_string: safe(product.dimension_string),
    tile_width_mm: safe(product.tile_width_mm),
    tile_height_mm: safe(product.tile_height_mm),
    tile_thickness_mm: safe(product.tile_thickness_mm),

    price_per_m2: safe(product.price_per_m2),
    price_per_tile: safe(product.price_per_tile),
    price_per_box: safe(product.price_per_box),

    tiles_per_box: safe(product.tiles_per_box),
    box_coverage_m2: safe(product.box_coverage_m2),
    weight_per_box: safe(product.weight_per_box),
    boxes_in_stock: safe(product.boxes_in_stock),
    boxes_per_pallet: safe(product.boxes_per_pallet),

    // LEAD TIME FIX — keep free text
    lead_time_days: safe(product.lead_time_days),

    attributes: arr(product.attributes),

    meta_title: safe(product.meta_title),
    meta_description: safe(product.meta_description),
    meta_keywords: safe(product.meta_keywords),

    og_image_url: safe(product.og_image_url),

    product_images: arr(product.product_images).map((img: any) => ({
      id: img.id,
      url: img.url || img.image_url,
      sort_order: img.sort_order ?? 0,
    })),
  };
}

export default function ProductFormClient({ mode, productId }: Props) {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  const [seoDirty, setSeoDirty] = useState({
    title: false,
    description: false,
    keywords: false,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [tileSizes, setTileSizes] = useState<any[]>([]);

  const [form, setForm] = useState<any>({
    id: productId,
    status: "draft",

    title: "",
    slug: "",
    description: "",
    display_id: "",
    supplier_id: "",

    category_ids: [],

    material: "",
    color: [],
    finish: [],
    application: [],
    suitable_room: [],
    indoor_outdoor: "",

    dimension_string: "",
    tile_width_mm: "",
    tile_height_mm: "",
    tile_thickness_mm: "",

    price_per_m2: "",
    price_per_tile: "",
    price_per_box: "",

    tiles_per_box: "",
    box_coverage_m2: "",
    weight_per_box: "",
    boxes_in_stock: "",
    boxes_per_pallet: "",
    lead_time_days: "",

    attributes: [],

    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_image_url: "",

    product_images: [],
  });

  const [newAttr, setNewAttr] = useState({ name: "", value: "" });

  /* -------------------------------------------------
     Load Base Data (categories, sizes)
  -------------------------------------------------- */
  useEffect(() => {
    async function loadBase() {
      const c = await fetch("/api/admin/categories/list").then(r => r.json());
      const s = await fetch("/api/public/tile-sizes").then(r => r.json());

      if (c.categories) setCategories(c.categories);
      if (s.tile_sizes) setTileSizes(s.tile_sizes);
    }
    loadBase();
  }, []);

  /* -------------------------------------------------
     Load Product for Edit Mode
  -------------------------------------------------- */
  useEffect(() => {
    if (mode !== "edit" || !productId) return;

    async function loadProduct() {
      const res = await fetch(`/api/admin/products/${productId}/get`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load product");
      }
      const json = await res.json();
      if (json.product) {
        const norm = normalize(json.product);
        setForm(norm);
      }
      setLoading(false);
    }
    loadProduct();
  }, [mode, productId]);

  /* -------------------------------------------------
     Update Field
  -------------------------------------------------- */
  function updateField(field: string, value: any) {
    setForm((p: any) => ({ ...p, [field]: value }));
  }

  function toggleArray(field: string, value: string) {
    setForm((p: any) => {
      const list = Array.isArray(p[field]) ? p[field] : [];
      return {
        ...p,
        [field]: list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value],
      };
    });
  }

  function toggleCategory(id: string) {
    setForm((p: any) => {
      const list = Array.isArray(p.category_ids) ? p.category_ids : [];
      return {
        ...p,
        category_ids: list.includes(id)
          ? list.filter((x: string) => x !== id)
          : [...list, id],
      };
    });
  }

  /* -------------------------------------------------
     Auto Slug
  -------------------------------------------------- */
  useEffect(() => {
    if (form.title && (!form.slug || mode === "create")) {
      updateField("slug", slugify(form.title));
    }
  }, [form.title]);

  /* -------------------------------------------------
     AUTO-SEO LOGIC
  -------------------------------------------------- */
  useEffect(() => {
    const title = form.title.trim();
    const material = form.material || "Tile";
    const application = form.application?.[0] || "Floor & Wall";
    const color = form.color?.[0] || "";

    if (!title) return;

    if (!seoDirty.title) {
      updateField("meta_title", `${title} | Buy ${material} Tiles Online | Bellos`);
    }

    if (!seoDirty.description) {
      updateField(
        "meta_description",
        `Shop ${title} ${material} tiles suitable for ${application}. ${color ? "Colour: " + color + ". " : ""}Available online at Bellos Tile Store.`
      );
    }

    if (!seoDirty.keywords) {
      updateField(
        "meta_keywords",
        `${title}, ${material} tiles, ${color}, bellos tiles, buy tiles online`
      );
    }
  }, [form.title, form.material, form.application, form.color]);

  /* -------------------------------------------------
     AUTO PRICING CALCULATIONS
  -------------------------------------------------- */
  useEffect(() => {
    const pricePerM2 = num(form.price_per_m2);
    const widthMm = num(form.tile_width_mm);
    const heightMm = num(form.tile_height_mm);

    if (pricePerM2 === null || widthMm === null || heightMm === null) return;

    const areaM2 = (widthMm * heightMm) / 1_000_000;
    if (areaM2 <= 0) return;

    const next = (pricePerM2 * areaM2).toFixed(2);
    if (next !== String(form.price_per_tile ?? "")) {
      updateField("price_per_tile", next);
    }
  }, [form.price_per_m2, form.tile_width_mm, form.tile_height_mm]);

  useEffect(() => {
    const pricePerTile = num(form.price_per_tile);
    const tilesPerBox = num(form.tiles_per_box);

    if (pricePerTile === null || tilesPerBox === null) return;
    if (tilesPerBox <= 0) return;

    const next = (pricePerTile * tilesPerBox).toFixed(2);
    if (next !== String(form.price_per_box ?? "")) {
      updateField("price_per_box", next);
    }
  }, [form.price_per_tile, form.tiles_per_box]);

  /* -------------------------------------------------
     SAVE HANDLER
  -------------------------------------------------- */
  async function handleSave() {
    setSaving(true);

    const endpoint =
      mode === "create"
        ? "/api/admin/products/create"
        : `/api/admin/products/${productId}/update`;

    const res = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(form),
    });

    const json = await res.json();
    setSaving(false);

    if (!json.success) {
      alert(json.error || "Failed to save");
      return;
    }

    alert("Saved!");
    window.location.href = "/admin/products";
  }

  if (loading) return <p className="p-10">Loading…</p>;

  /* -------------------------------------------------
     Tabs
  -------------------------------------------------- */
  const tabs = [
    { id: "general", label: "General" },
    { id: "dimensions", label: "Dimensions" },
    { id: "pricing", label: "Pricing" },
    { id: "packaging", label: "Packaging" },
    { id: "filters", label: "Filters" },
    { id: "technical", label: "Technical" },
    { id: "seo", label: "SEO" },
    { id: "images", label: "Images" },
  ];

  /* -------------------------------------------------
     UI
  -------------------------------------------------- */
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        {mode === "create" ? "Create Product" : "Edit Product"}
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={clsx(
              "pb-3",
              activeTab === t.id
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            )}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* -------- GENERAL TAB -------- */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <input
            className="border p-3 w-full"
            placeholder="Product Title"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
          />

          <div>
            <label className="font-semibold block mb-2">Slug</label>
            <input
              className="border p-3 w-full"
              value={form.slug}
              onChange={(e) => updateField("slug", slugify(e.target.value))}
            />
          </div>

          <textarea
            className="border p-3 w-full h-24"
            placeholder="Description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />

          {/* Identification */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold text-lg">Product Identifiers</h3>

            <input
              className="border p-3 w-full"
              placeholder="Display ID (Front-End)"
              value={form.display_id}
              onChange={(e) => updateField("display_id", e.target.value)}
            />

            <input
              className="border p-3 w-full"
              placeholder="Supplier ID (Internal)"
              value={form.supplier_id}
              onChange={(e) => updateField("supplier_id", e.target.value)}
            />
          </div>

          {/* Categories */}
          <div>
            <label className="font-semibold block mb-2">Categories</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.category_ids.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-2">Status</label>
            <select
              className="border p-3 w-full"
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>
      )}

      {/* -------- DIMENSIONS -------- */}
      {activeTab === "dimensions" && (
        <div className="space-y-6">
          <select
            className="border p-3 w-full"
            value={form.dimension_string}
            onChange={(e) => {
              const s = tileSizes.find((x) => x.label === e.target.value);
              updateField("dimension_string", e.target.value);
              if (s) {
                updateField("tile_width_mm", s.width_mm);
                updateField("tile_height_mm", s.height_mm);
              }
            }}
          >
            <option value="">Select Size</option>
            {tileSizes.map((s) => (
              <option key={s.id} value={s.label}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-3 gap-4">
            <input
              className="border p-3 bg-gray-100"
              value={form.tile_width_mm}
              readOnly
            />
            <input
              className="border p-3 bg-gray-100"
              value={form.tile_height_mm}
              readOnly
            />
            <input
              className="border p-3"
              placeholder="Thickness (mm)"
              type="number"
              inputMode="decimal"
              step="any"
              value={form.tile_thickness_mm}
              onChange={(e) =>
                updateField("tile_thickness_mm", e.target.value)
              }
            />
          </div>
        </div>
      )}

      {/* -------- PRICING -------- */}
      {activeTab === "pricing" && (
        <div className="grid grid-cols-3 gap-4">
          <input
            className="border p-3"
            placeholder="Price per m²"
            value={form.price_per_m2}
            onChange={(e) => updateField("price_per_m2", e.target.value)}
          />
          <input
            className="border p-3"
            placeholder="Price per tile"
            value={form.price_per_tile}
            onChange={(e) => updateField("price_per_tile", e.target.value)}
          />
          <input
            className="border p-3"
            placeholder="Price per box"
            value={form.price_per_box}
            onChange={(e) => updateField("price_per_box", e.target.value)}
          />
        </div>
      )}

      {/* -------- PACKAGING -------- */}
      {activeTab === "packaging" && (
        <div className="grid grid-cols-3 gap-4">
          <input
            className="border p-3"
            placeholder="Tiles per box"
            value={form.tiles_per_box}
            onChange={(e) => updateField("tiles_per_box", e.target.value)}
          />
          <input
            className="border p-3"
            placeholder="m² per box"
            value={form.box_coverage_m2}
            onChange={(e) => updateField("box_coverage_m2", e.target.value)}
          />
          <input
            className="border p-3"
            placeholder="Weight per box"
            value={form.weight_per_box}
            onChange={(e) => updateField("weight_per_box", e.target.value)}
          />

          <input
            className="border p-3"
            placeholder="Boxes in stock"
            value={form.boxes_in_stock}
            onChange={(e) => updateField("boxes_in_stock", e.target.value)}
          />

          <input
            className="border p-3"
            placeholder="Boxes per pallet"
            value={form.boxes_per_pallet}
            onChange={(e) => updateField("boxes_per_pallet", e.target.value)}
          />

          <input
            className="border p-3"
            placeholder="Lead time (3–5 days allowed)"
            value={form.lead_time_days}
            onChange={(e) => updateField("lead_time_days", e.target.value)}
          />
        </div>
      )}

      {/* -------- FILTERS -------- */}
      {activeTab === "filters" && (
        <div className="space-y-6">

          <div>
            <label className="font-semibold block mb-2">Material</label>
            <select
              className="border p-3 w-full"
              value={form.material}
              onChange={(e) => updateField("material", e.target.value)}
            >
              <option value="">Select</option>
              <option value="Ceramic">Ceramic</option>
              <option value="Porcelain">Porcelain</option>
            </select>
          </div>

          {/* FINISHES */}
<div>
  <label className="font-semibold block mb-2">Finish</label>
  <div className="grid grid-cols-3 gap-2">
    {[
      "Matt",
      "Gloss",
      "Satin",
      "Polished",
      "Honed",
      "Textured",
      "Lappato",
      "Anti-Slip"
    ].map((f) => (
      <label key={f} className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Array.isArray(form.finish) && form.finish.includes(f)}
          onChange={() => toggleArray("finish", f)}
        />
        {f}
      </label>
    ))}
  </div>
</div>


          <div>
            <label className="font-semibold block mb-2">Colour</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                "Beige",
                "Black",
                "Brown",
                "Dark Grey",
                "Grey",
                "Light Grey",
                "White",
                "Cream",
                "Green",
                "Blue",
                "Purple",
                "Multi Colour",
              ].map((c) => (
                <label key={c} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.color.includes(c)}
                    onChange={() => toggleArray("color", c)}
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-2">Application</label>
            <div className="grid grid-cols-3 gap-2">
              {["Floor", "Wall", "Countertop"].map((a) => (
                <label key={a} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.application.includes(a)}
                    onChange={() => toggleArray("application", a)}
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-2">Suitable Rooms</label>
            <div className="grid grid-cols-3 gap-2">
              {["Any", "Lounge", "Kitchen", "Bathroom", "Commercial"].map(
                (room) => (
                  <label key={room} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.suitable_room.includes(room)}
                      onChange={() => toggleArray("suitable_room", room)}
                    />
                    {room}
                  </label>
                )
              )}
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-2">Indoor / Outdoor</label>
            <select
              className="border p-3 w-full"
              value={form.indoor_outdoor}
              onChange={(e) => updateField("indoor_outdoor", e.target.value)}
            >
              <option value="">Select</option>
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
            </select>
          </div>
        </div>
      )}

      

      {/* -------- TECHNICAL -------- */}
      {activeTab === "technical" && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <input
              className="border p-3"
              placeholder="Attribute Name"
              value={newAttr.name}
              onChange={(e) =>
                setNewAttr((p) => ({ ...p, name: e.target.value }))
              }
            />
            <input
              className="border p-3"
              placeholder="Value"
              value={newAttr.value}
              onChange={(e) =>
                setNewAttr((p) => ({ ...p, value: e.target.value }))
              }
            />
            <button
              className="px-4 bg-blue-600 text-white rounded"
              onClick={() => {
                if (!newAttr.name || !newAttr.value) return;
                updateField("attributes", [...form.attributes, newAttr]);
                setNewAttr({ name: "", value: "" });
              }}
            >
              Add
            </button>
          </div>

          {form.attributes.length > 0 &&
            form.attributes.map((a: any, i: number) => (
              <div key={i} className="border p-3 rounded">
                <strong>{a.name}</strong>: {a.value}
              </div>
            ))}
        </div>
      )}

      {/* -------- SEO TAB -------- */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          <input
            className="border p-3 w-full"
            placeholder="Meta Title"
            value={form.meta_title}
            onChange={(e) => {
              setSeoDirty((p) => ({ ...p, title: true }));
              updateField("meta_title", e.target.value);
            }}
          />

          <textarea
            className="border p-3 w-full h-24"
            placeholder="Meta Description"
            value={form.meta_description}
            onChange={(e) => {
              setSeoDirty((p) => ({ ...p, description: true }));
              updateField("meta_description", e.target.value);
            }}
          />

          <input
            className="border p-3 w-full"
            placeholder="Meta Keywords"
            value={form.meta_keywords}
            onChange={(e) => {
              setSeoDirty((p) => ({ ...p, keywords: true }));
              updateField("meta_keywords", e.target.value);
            }}
          />

          <input
            className="border p-3 w-full"
            placeholder="OG Image URL"
            value={form.og_image_url}
            onChange={(e) => updateField("og_image_url", e.target.value)}
          />
        </div>
      )}

      {/* -------- IMAGES -------- */}
      {activeTab === "images" && (
        <div className="p-6 border rounded bg-white">
          <ImageUploader
            productId={form.id}
            images={form.product_images}
            onChange={(imgs) => updateField("product_images", imgs)}
          />
        </div>
      )}

      {/* SAVE */}
      <button
        className="mt-8 px-6 py-3 bg-green-600 text-white rounded"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving…" : "Save Product"}
      </button>
    </div>
  );
}
