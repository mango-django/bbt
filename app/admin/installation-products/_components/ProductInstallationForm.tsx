"use client";

import { useState, useEffect } from "react";
import ImageUploader from "@/components/admin/ImageUploader";

const PRODUCT_TYPES = [
  "adhesive",
  "grout",
  "sealer",
  "trim",
  "tool",
  "levelling",
  "primer",
] as const;
type ProductType = (typeof PRODUCT_TYPES)[number];

export interface InstallationProduct {
  id?: string;
  name: string;
  slug: string;
  product_type: ProductType;
  colour: string;
  unit_type: "kg" | "litre";
  unit_amount: string;
  description: string;
  price: string;
  stock_qty: string;
  images: any[];

  status: "draft" | "active";

  seo_title: string;
  seo_description: string;
  seo_keywords: string;

  // ⭐ NEW FIELDS
  display_id?: string;
  supplier_id?: string;
}

type Props = {
  mode: "create" | "edit";
  product?: InstallationProduct | null;
};

export default function ProductInstallationForm({ mode, product }: Props) {
  const isEdit = mode === "edit";

  // -----------------------------------------
  // INITIAL FORM STATE
  // -----------------------------------------
  const [form, setForm] = useState<InstallationProduct>({
    id: product?.id,
    name: product?.name || "",
    slug: product?.slug || "",
    product_type: product?.product_type || "adhesive",
    colour: product?.colour || "N/A",
    unit_type: product?.unit_type || "kg",
    unit_amount: product?.unit_amount || "",
    description: product?.description || "",
    price: product?.price?.toString() ?? "",
    stock_qty: product?.stock_qty?.toString() ?? "",
    images: product?.images || [],
    status: product?.status || "draft",

    seo_title: product?.seo_title || "",
    seo_description: product?.seo_description || "",
    seo_keywords: product?.seo_keywords || "",

    // ⭐ Added new identifiers
    display_id: product?.display_id || "",
    supplier_id: product?.supplier_id || "",
  });

  // -----------------------------------------
  // SEO "DIRTY" FLAGS — prevents overwriting user edits
  // -----------------------------------------
  const [seoDirty, setSeoDirty] = useState({
    title: !!product?.seo_title,
    description: !!product?.seo_description,
    keywords: !!product?.seo_keywords,
  });

  // -----------------------------------------
  // UPDATE FIELD
  // -----------------------------------------
  function updateField<K extends keyof InstallationProduct>(
    key: K,
    value: InstallationProduct[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // -----------------------------------------
  // AUTO SLUG GENERATION
  // -----------------------------------------
  useEffect(() => {
    if (!isEdit || !form.slug) {
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setForm((p) => ({ ...p, slug }));
    }
  }, [form.name]);

  // -----------------------------------------
  // AUTO SEO GENERATION
  // -----------------------------------------
  useEffect(() => {
    const name = form.name?.trim();
    if (!name) return;

    const type = form.product_type;
    const colour = form.colour;

    if (!seoDirty.title) {
      updateField("seo_title", `${name} | ${type} | Bellos Tile Store`);
    }

    if (!seoDirty.description) {
      updateField(
        "seo_description",
        `Buy ${name}, a high-quality ${type} available in ${colour}. Ideal for professional tile installation. Order online from Bellos.`
      );
    }

    if (!seoDirty.keywords) {
      updateField(
        "seo_keywords",
        `${name}, ${type}, ${colour} ${type}, tile installation, bellos`
      );
    }
  }, [form.name, form.product_type, form.colour]);

  // -----------------------------------------
  // VALIDATION
  // -----------------------------------------
  function validate() {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.slug.trim()) return "Slug cannot be empty.";
    if (!form.price || Number(form.price) <= 0)
      return "Price must be greater than zero.";
    if (!form.unit_amount.trim())
      return "Unit amount is required.";
    if (form.status === "active" && (!form.images || form.images.length === 0))
      return "Active products must have at least one image.";
    return null;
  }

  // -----------------------------------------
  // SAVE HANDLER
  // -----------------------------------------
  async function save() {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    const endpoint = isEdit
      ? `/api/admin/installation-products/${product?.id}/update`
      : `/api/admin/installation-products/create-draft`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    if (!json.success) {
      alert(json.error || "Failed to save");
      return;
    }

    alert("Saved!");
    window.location.href = "/admin/installation-products";
  }

  // -----------------------------------------
  // UI — SINGLE PAGE FORM
  // -----------------------------------------
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">
        {isEdit ? "Edit Installation Product" : "Create Installation Product"}
      </h1>

      {/* PRODUCT NAME */}
      <div>
        <label className="font-semibold block mb-1">Product Name</label>
        <input
          type="text"
          className="w-full border p-3 rounded"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
      </div>

      {/* SLUG */}
      <div>
        <label className="font-semibold block mb-1">Slug (URL)</label>
        <input
          type="text"
          className="w-full border p-3 rounded"
          value={form.slug}
          onChange={(e) => updateField("slug", e.target.value)}
        />
      </div>

      {/* PRODUCT TYPE */}
      <div>
        <label className="font-semibold block mb-1">Product Type</label>
        <select
          className="w-full border p-3 rounded"
          value={form.product_type}
          onChange={(e) =>
            updateField("product_type", e.target.value as ProductType)
          }
        >
          {PRODUCT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* COLOUR */}
      <div>
        <label className="font-semibold block mb-1">Colour</label>
        <select
          className="w-full border p-3 rounded"
          value={form.colour}
          onChange={(e) => updateField("colour", e.target.value)}
        >
          {[
            "N/A","Beige","Black","Brown","Buff","Grey",
            "Jasmine","Limestone","Silver","White",
          ].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* UNIT DETAILS */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-semibold block mb-1">Unit Type</label>
          <select
            className="w-full border p-3 rounded"
            value={form.unit_type}
            onChange={(e) =>
              updateField("unit_type", e.target.value as "kg" | "litre")
            }
          >
            <option value="kg">KG</option>
            <option value="litre">Litre</option>
          </select>
        </div>

        <div>
          <label className="font-semibold block mb-1">Unit Amount</label>
          <input
            type="text"
            className="w-full border p-3 rounded"
            value={form.unit_amount}
            onChange={(e) => updateField("unit_amount", e.target.value)}
          />
        </div>
      </div>

      {/* PRICE */}
      <div>
        <label className="font-semibold block mb-1">Price (£)</label>
        <input
          type="number"
          className="w-full border p-3 rounded"
          value={form.price}
          onChange={(e) => updateField("price", e.target.value)}
        />
      </div>

      {/* STOCK */}
      <div>
        <label className="font-semibold block mb-1">Stock Quantity</label>
        <input
          type="number"
          className="w-full border p-3 rounded"
          value={form.stock_qty}
          onChange={(e) => updateField("stock_qty", e.target.value)}
        />
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="font-semibold block mb-1">Description</label>
        <textarea
          className="w-full border p-3 rounded h-32"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
      </div>

      {/* IMAGES */}
      <div>
        <label className="font-semibold block mb-2">Images</label>
        <ImageUploader
          productId={form.id || ""}
          images={form.images}
          onChange={(imgs) => updateField("images", imgs)}
          resourceBasePath="/api/admin/installation-products"
        />
      </div>

      {/* PRODUCT IDENTIFIERS */}
      <div className="border-t pt-6 space-y-4">
        <h2 className="text-xl font-semibold">Product Identifiers</h2>

        {/* Display ID */}
        <div>
          <label className="font-semibold block mb-1">Product ID (Front-End)</label>
          <input
            type="text"
            className="w-full border p-3 rounded"
            value={form.display_id || ""}
            onChange={(e) => updateField("display_id", e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Shown on product page — optional.
          </p>
        </div>

        {/* Supplier ID */}
        <div>
          <label className="font-semibold block mb-1">Supplier ID (Backend Only)</label>
          <input
            type="text"
            className="w-full border p-3 rounded"
            value={form.supplier_id || ""}
            onChange={(e) => updateField("supplier_id", e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Used internally for ordering stock — optional.
          </p>
        </div>
      </div>

      {/* SEO SECTION */}
      <div className="border-t pt-6 space-y-4">
        <h2 className="text-xl font-semibold">SEO Settings</h2>

        {/* SEO TITLE */}
        <div>
          <label className="font-semibold block mb-1">SEO Title</label>
          <input
            type="text"
            className="w-full border p-3 rounded"
            value={form.seo_title}
            onChange={(e) => {
              setSeoDirty((d) => ({ ...d, title: true }));
              updateField("seo_title", e.target.value);
            }}
          />
        </div>

        {/* SEO DESCRIPTION */}
        <div>
          <label className="font-semibold block mb-1">SEO Description</label>
          <textarea
            className="w-full border p-3 rounded h-24"
            value={form.seo_description}
            onChange={(e) => {
              setSeoDirty((d) => ({ ...d, description: true }));
              updateField("seo_description", e.target.value);
            }}
          />
        </div>

        {/* SEO KEYWORDS */}
        <div>
          <label className="font-semibold block mb-1">SEO Keywords</label>
          <input
            type="text"
            className="w-full border p-3 rounded"
            value={form.seo_keywords}
            onChange={(e) => {
              setSeoDirty((d) => ({ ...d, keywords: true }));
              updateField("seo_keywords", e.target.value);
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate keywords with commas.
          </p>
        </div>
      </div>

      {/* STATUS */}
      <div>
        <label className="font-semibold block mb-1">Status</label>
        <select
          className="w-full border p-3 rounded"
          value={form.status}
          onChange={(e) =>
            updateField("status", e.target.value as "draft" | "active")
          }
        >
          <option value="draft">Draft (hidden from storefront)</option>
          <option value="active">Active (visible on storefront)</option>
        </select>
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={save}
        className="px-6 py-3 bg-blue-600 text-white rounded"
      >
        Save Product
      </button>
    </div>
  );
}
