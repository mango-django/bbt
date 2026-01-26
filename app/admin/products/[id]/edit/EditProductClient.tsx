"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import ImageUploader from "@/components/admin/ImageUploader";
import { slugify } from "@/lib/slugify";

const num = (v: any) => {
  const parsed = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

export default function EditProductClient({ productId }: { productId: string }) {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [tileSizes, setTileSizes] = useState<any[]>([]);

  /* ---------------------------------------------
     FORM STATE — STRUCTURED + MATCHES DB
  --------------------------------------------- */
  const [form, setForm] = useState<any>({
    id: productId,

    status: "draft",
    title: "",
    slug: "",
    description: "",

    category_ids: [],

    material: "",
    color: [],
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
    og_image_url: "",

    product_images: [],
  });

  const [newAttr, setNewAttr] = useState({ name: "", value: "" });

  /* ---------------------------------------------
     LOAD PRODUCT
  --------------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        const [catRes, sizeRes, prodRes] = await Promise.all([
          fetch("/api/admin/categories/list"),
          fetch("/api/admin/tile-sizes/list"),
          fetch(`/api/admin/products/${productId}/get`),
        ]);

        const cat = await catRes.json();
        const sizes = await sizeRes.json();
        const prodJson = await prodRes.json();

        if (cat.categories) setCategories(cat.categories);
        if (sizes.tile_sizes) setTileSizes(sizes.tile_sizes);

        if (prodJson.product) {
          const p = prodJson.product;

          setForm((prev: any) => ({
            ...prev,
            ...p,
            color: p.color ?? [],
            application: p.application ?? [],
            suitable_room: p.suitable_room ?? [],
            attributes: p.attributes ?? [],
            category_ids: p.category_ids ?? [],
            product_images: p.product_images ?? [],
          }));
        }
      } catch (err) {
        console.error("Load error:", err);
      }

      setLoading(false);
    }

    load();
  }, [productId]);

  /* ---------------------------------------------
     FORM HELPERS
  --------------------------------------------- */
  function updateField(field: string, value: any) {
    setForm((prev: any) => {
      let updated = { ...prev, [field]: value };

      // auto-generate slug based on title
      if (field === "title") updated.slug = slugify(value);

      return updated;
    });
  }

  function toggleArray(field: string, value: string) {
    setForm((prev: any) => {
      const arr = Array.isArray(prev[field]) ? prev[field] : [];
      return arr.includes(value)
        ? { ...prev, [field]: arr.filter((v) => v !== value) }
        : { ...prev, [field]: [...arr, value] };
    });
  }

  function toggleCategory(id: string) {
    setForm((prev: any) => {
      return prev.category_ids.includes(id)
        ? {
            ...prev,
            category_ids: prev.category_ids.filter((x: string) => x !== id),
          }
        : {
            ...prev,
            category_ids: [...prev.category_ids, id],
          };
    });
  }

  function addAttribute() {
    if (!newAttr.name || !newAttr.value) return;
    setForm((prev: any) => ({
      ...prev,
      attributes: [...prev.attributes, { ...newAttr }],
    }));
    setNewAttr({ name: "", value: "" });
  }

  /* ---------------------------------------------
     AUTO PRICING CALCULATIONS
  --------------------------------------------- */
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

  /* ---------------------------------------------
     SAVE PRODUCT
  --------------------------------------------- */
  async function handleSave() {
    if (!form.slug.trim()) {
      alert("Slug is required");
      return;
    }

    setSaving(true);

    const res = await fetch(`/api/admin/products/${productId}/update`, {
      method: "POST",
      body: JSON.stringify(form),
    });

    const json = await res.json();
    setSaving(false);

    if (!json.success) {
      console.error(json);
      alert("Failed to save");
      return;
    }

    alert("Product updated!");
  }

  async function handleDelete() {
    if (!confirm("Are you sure?")) return;

    const res = await fetch(`/api/admin/products/${productId}/delete`, {
      method: "POST",
    });

    const json = await res.json();

    if (!json.success) {
      alert("Failed to delete");
      return;
    }

    window.location.href = "/admin/products";
  }

  /* ---------------------------------------------
     TABS SETUP
  --------------------------------------------- */
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

  if (loading) return <p className="p-10">Loading…</p>;

  /* ---------------------------------------------
     RENDER UI
  --------------------------------------------- */
  return (
    <div className="p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Delete
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={clsx(
              "pb-3 text-lg",
              activeTab === t.id
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* --------------------------------------------- */}
      {/* GENERAL */}
      {/* --------------------------------------------- */}
      {activeTab === "general" && (
        <div className="space-y-6">

          <input
            className="w-full border p-3"
            placeholder="Title"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
          />

          {/* Slug */}
          <div>
            <label className="font-semibold block mb-1">Slug</label>
            <div className="flex gap-3">
              <input
                className="w-full border p-3"
                placeholder="Slug"
                value={form.slug}
                onChange={(e) => updateField("slug", slugify(e.target.value))}
              />
              <button
                onClick={() => updateField("slug", slugify(form.title))}
                className="px-3 py-2 bg-gray-200 rounded"
              >
                ↻
              </button>
            </div>
          </div>

          <textarea
            className="w-full border p-3 h-32"
            placeholder="Description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />

          {/* Categories */}
          <h3 className="font-semibold text-xl">Categories</h3>
          <div className="grid grid-cols-2 gap-3">
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

          {/* Status */}
          <h3 className="font-semibold text-xl">Status</h3>
          <select
            className="border p-3"
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>

        </div>
      )}

      {/* --------------------------------------------- */}
      {/* DIMENSIONS */}
      {/* --------------------------------------------- */}
      {activeTab === "dimensions" && (
        <div className="space-y-6">

          <select
            className="border p-3 w-full"
            value={form.dimension_string}
            onChange={(e) => {
              const size = tileSizes.find((s) => s.label === e.target.value);
              updateField("dimension_string", e.target.value);
              if (size) {
                updateField("tile_width_mm", size.width_mm);
                updateField("tile_height_mm", size.height_mm);
              }
            }}
          >
            <option value="">Select Tile Size</option>
            {tileSizes.map((t) => (
              <option key={t.id} value={t.label}>
                {t.label}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-3 gap-4">
            <input className="border p-3" readOnly value={form.tile_width_mm} />
            <input className="border p-3" readOnly value={form.tile_height_mm} />
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

      {/* --------------------------------------------- */}
      {/* PRICING */}
      {/* --------------------------------------------- */}
      {activeTab === "pricing" && (
        <div className="grid grid-cols-3 gap-4">

          <input
            className="border p-3"
            placeholder="Price / m²"
            value={form.price_per_m2}
            onChange={(e) => updateField("price_per_m2", e.target.value)}
          />

          <input
            className="border p-3"
            placeholder="Price / tile"
            value={form.price_per_tile}
            onChange={(e) => updateField("price_per_tile", e.target.value)}
          />

          <input
            className="border p-3"
            placeholder="Price / box"
            value={form.price_per_box}
            onChange={(e) => updateField("price_per_box", e.target.value)}
          />

        </div>
      )}

      {/* --------------------------------------------- */}
      {/* PACKAGING */}
      {/* --------------------------------------------- */}
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
            placeholder="Weight per box (kg)"
            value={form.weight_per_box}
            onChange={(e) => updateField("weight_per_box", e.target.value)}
          />

          <input
            className="border p-3"
            placeholder="Stock"
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
            placeholder="Lead time (days)"
            value={form.lead_time_days}
            onChange={(e) => updateField("lead_time_days", e.target.value)}
          />

        </div>
      )}

      {/* --------------------------------------------- */}
      {/* FILTERS */}
      {/* --------------------------------------------- */}
      {activeTab === "filters" && (
        <div className="space-y-6">

          {/* MATERIAL */}
          <div>
            <label className="font-semibold block mb-2">Material</label>
            <select
              className="border p-3 w-full"
              value={form.material}
              onChange={(e) => updateField("material", e.target.value)}
            >
              <option value="">Select</option>
              <option value="Porcelain">Porcelain</option>
              <option value="Ceramic">Ceramic</option>
            </select>
          </div>

          {/* COLOUR */}
          <div>
            <label className="font-semibold block mb-2">Colour</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                "Beige",
                "Black",
                "Brown",
                "Grey",
                "White",
                "Cream",
                "Green",
                "Blue",
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

          {/* APPLICATION */}
          <div>
            <label className="font-semibold block mb-2">Application</label>
            <div className="grid grid-cols-3 gap-2">
              {["Floor", "Wall", "Outdoor", "Commercial"].map((a) => (
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

          {/* SUITABLE ROOMS */}
          <div>
            <label className="font-semibold block mb-2">Suitable Rooms</label>
            <div className="grid grid-cols-3 gap-2">
              {["Kitchen", "Bathroom", "Lounge", "Commercial"].map((room) => (
                <label key={room} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.suitable_room.includes(room)}
                    onChange={() => toggleArray("suitable_room", room)}
                  />
                  {room}
                </label>
              ))}
            </div>
          </div>

          {/* INDOOR / OUTDOOR */}
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

      {/* --------------------------------------------- */}
      {/* TECHNICAL */}
      {/* --------------------------------------------- */}
      {activeTab === "technical" && (
        <div className="space-y-4">

          {/* Add attribute inputs */}
          <div className="flex gap-3">
            <input
              className="border p-3 flex-1"
              placeholder="Attribute Name"
              value={newAttr.name}
              onChange={(e) =>
                setNewAttr((p) => ({ ...p, name: e.target.value }))
              }
            />
            <input
              className="border p-3 flex-1"
              placeholder="Value"
              value={newAttr.value}
              onChange={(e) =>
                setNewAttr((p) => ({ ...p, value: e.target.value }))
              }
            />
            <button
              onClick={addAttribute}
              className="px-4 bg-blue-600 text-white rounded"
            >
              Add
            </button>
          </div>

          {/* List attributes */}
          {form.attributes.map((attr: any, i: number) => (
            <div key={i} className="border p-3 rounded">
              <strong>{attr.name}</strong>: {attr.value}
            </div>
          ))}

        </div>
      )}

      {/* --------------------------------------------- */}
      {/* SEO */}
      {/* --------------------------------------------- */}
      {activeTab === "seo" && (
  <div className="space-y-4">
    <input
      className="border p-3 w-full"
      placeholder="Meta Title"
      value={form.meta_title || ""}
      onChange={(e) => updateField("meta_title", e.target.value)}
    />

    <textarea
      className="border p-3 w-full h-24"
      placeholder="Meta Description"
      value={form.meta_description || ""}
      onChange={(e) => updateField("meta_description", e.target.value)}
    />

    <input
      className="border p-3 w-full"
      placeholder="OG Image URL"
      value={form.og_image_url || ""}
      onChange={(e) => updateField("og_image_url", e.target.value)}
    />
  </div>
)}


      {/* --------------------------------------------- */}
      {/* IMAGES */}
      {/* --------------------------------------------- */}
      {activeTab === "images" && (
        <div className="p-6 border rounded bg-white">
          <ImageUploader
            productId={productId}
            images={form.product_images}
            onChange={(imgs: any[]) => updateField("product_images", imgs)}
          />
        </div>
      )}

      {/* SAVE BUTTON */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-10 px-6 py-3 bg-green-600 text-white rounded"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
