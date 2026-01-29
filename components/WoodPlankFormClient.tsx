"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function WoodPlankFormClient({
  plank,
  plankId,
  mode = "edit",
}: {
  plank?: any;
  plankId?: string;
  mode?: "create" | "edit";
}) {
  const supabase = supabaseBrowser();

  const [recordId, setRecordId] = useState<string | undefined>(
    plank?.id ?? plankId
  );

  const [tab, setTab] = useState<"details" | "images" | "seo">("details");
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: plank?.title ?? "",
    slug: plank?.slug ?? "",
    description: plank?.description ?? "",

    price_per_box: plank?.price_per_box ?? "",
    coverage_per_box: plank?.coverage_per_box ?? "",

    plank_length_mm: plank?.plank_length_mm ?? "",
    plank_width_mm: plank?.plank_width_mm ?? "",
    thickness_mm: plank?.thickness_mm ?? "",

    boxes_in_stock: plank?.boxes_in_stock ?? "",
    weight_per_box: plank?.weight_per_box ?? "",

    images: Array.isArray(plank?.images) ? plank.images : [],

    meta_title: plank?.meta_title ?? "",
    meta_description: plank?.meta_description ?? "",
    og_image_url: plank?.og_image_url ?? "",

    is_active: plank?.is_active ?? false,
  });

  const numberFields = new Set([
    "price_per_box",
    "coverage_per_box",
    "plank_length_mm",
    "plank_width_mm",
    "thickness_mm",
    "boxes_in_stock",
    "weight_per_box",
  ]);

  function buildPayload() {
    const payload: Record<string, any> = { ...form };

    for (const key of Object.keys(payload)) {
      if (numberFields.has(key)) {
        payload[key] =
          payload[key] === "" ? null : Number(payload[key]);
      }
    }

    payload.slug = slugify(payload.slug || payload.title || "");
    if (!payload.slug) return null;

    return payload;
  }

  function getStoragePathFromPublicUrl(url: string) {
    const marker = "/storage/v1/object/public/";
    const index = url.indexOf(marker);
    if (index === -1) return null;
    return url.substring(index + marker.length);
  }

  async function deleteImage(url: string) {
    if (!recordId) return;

    const newImages = form.images.filter((img: string) => img !== url);
    setForm((prev) => ({ ...prev, images: newImages }));

    await supabase
      .from("wood_planks")
      .update({ images: newImages })
      .eq("id", recordId);

    const path = getStoragePathFromPublicUrl(url);
    if (path) {
      await supabase.storage.from("wood-planks").remove([path]);
    }
  }

  /* -------------------------------
     SAVE (draft-safe)
  -------------------------------- */
  async function save() {
    const payload = buildPayload();
    if (!payload) {
      alert("Title or slug is required.");
      return;
    }

    setSaving(true);
    try {
      if (recordId) {
        const { error } = await supabase
          .from("wood_planks")
          .update(payload)
          .eq("id", recordId);

        if (error) {
          alert(error.message);
          return;
        }

        alert("Saved");
        return;
      }

      const { data, error } = await supabase
        .from("wood_planks")
        .insert({
          ...payload,
          images: payload.images ?? [],
        })
        .select("id")
        .single();

      if (error || !data) {
        alert(error?.message ?? "Failed to create wood plank.");
        return;
      }

      setRecordId(data.id);
      alert("Saved");
    } catch (err: any) {
      alert(err?.message ?? "Failed to save wood plank.");
    } finally {
      setSaving(false);
    }
  }

  /* -------------------------------
     IMAGE UPLOAD (FIXED)
  -------------------------------- */
  async function uploadImages(files: FileList) {
    if (!recordId) {
      alert("Please save the draft before uploading images.");
      return;
    }

    setUploading(true);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${recordId}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("wood-planks")
        .upload(path, file, {
  upsert: true,
});

      if (error) {
  console.error("UPLOAD ERROR:", error);
  alert(error.message);
  continue;
}

      const { data } = supabase.storage
        .from("wood-planks")
        .getPublicUrl(path);

      const newImages = [...form.images, data.publicUrl];

      // update local state
      setForm((prev) => ({
        ...prev,
        images: newImages,
      }));

      // Persist to DB so images show after refresh
      await supabase
        .from("wood_planks")
        .update({ images: newImages })
        .eq("id", recordId);
    }

    setUploading(false);
  }

  return (
    <div className="p-10 max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">
        {mode === "create"
          ? "New Wood Plank (Draft)"
          : "Edit Wood Plank"}
      </h1>

      {/* TABS */}
      <div className="flex gap-6 border-b pb-2">
        {["details", "images", "seo"].map((t) => (
          <button
            key={t}
            className={tab === t ? "font-semibold" : "text-gray-400"}
            onClick={() => setTab(t as any)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* DETAILS TAB */}
      {tab === "details" && (
        <div className="space-y-4">
          <input
            placeholder="Title"
            className="w-full border p-3"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
                slug: !slugTouched
                  ? slugify(e.target.value)
                  : form.slug,
              })
            }
          />

          <input
            placeholder="Slug"
            disabled={form.is_active}
            className="w-full border p-3"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm({
                ...form,
                slug: slugify(e.target.value),
              });
            }}
          />

          <textarea
            placeholder="Description"
            className="w-full border p-3"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

          {[
            { key: "price_per_box", label: "Price per box", suffix: "£0.00" },
            { key: "coverage_per_box", label: "Coverage per box", suffix: "m²" },
            { key: "plank_length_mm", label: "Plank length", suffix: "mm" },
            { key: "plank_width_mm", label: "Plank width", suffix: "mm" },
            { key: "thickness_mm", label: "Thickness", suffix: "mm" },
            { key: "boxes_in_stock", label: "Boxes in stock", suffix: "boxes" },
            { key: "weight_per_box", label: "Weight per box", suffix: "kg" },
          ].map(({ key, label, suffix }) => (
            <div key={key} className="relative">
              <input
                placeholder={label}
                className="w-full border p-3 pr-20"
                value={(form as any)[key]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]: e.target.value,
                  })
                }
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                {suffix}
              </span>
            </div>
          ))}

          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({
                  ...form,
                  is_active: e.target.checked,
                })
              }
            />
            Active
          </label>
        </div>
      )}

      {/* IMAGES TAB */}
      {tab === "images" && (
        <div>
          <div
            className="border-2 border-dashed p-10 text-center"
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const files = e.dataTransfer?.files;
              if (!files || files.length === 0) return;
              uploadImages(files);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
          >
            Drag & drop images here
          </div>

          {uploading && <p>Uploading…</p>}

          <div className="grid grid-cols-4 gap-4 mt-4">
  {form.images.map((url: string) => (
    <div
      key={url}
      className="relative group border"
    >
      <img
        src={url}
        className="h-32 w-full object-cover"
      />

      <button
        onClick={() => deleteImage(url)}
        className="absolute top-1 right-1 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition"
      >
        ✕
      </button>
    </div>
  ))}
</div>

        </div>
      )}

      {/* SEO TAB */}
      {tab === "seo" && (
        <div className="space-y-4">
          <input
            placeholder="Meta Title"
            className="w-full border p-3"
            value={form.meta_title}
            onChange={(e) =>
              setForm({
                ...form,
                meta_title: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Meta Description"
            className="w-full border p-3"
            value={form.meta_description}
            onChange={(e) =>
              setForm({
                ...form,
                meta_description: e.target.value,
              })
            }
          />

          <input
            placeholder="OG Image URL"
            className="w-full border p-3"
            value={form.og_image_url}
            onChange={(e) =>
              setForm({
                ...form,
                og_image_url: e.target.value,
              })
            }
          />
        </div>
      )}

      <button
        onClick={save}
        className="px-6 py-3 bg-black text-white"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
