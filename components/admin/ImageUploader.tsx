"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { ReactSortable } from "react-sortablejs";

type Props = {
  productId: string;
  images: any[];
  onChange: (imgs: any[]) => void;
  resourceBasePath?: string;
};

function extractFilePath(img: any) {
  if (img?.file_path) return img.file_path;
  const url = img?.url || img?.image_url;

  if (!url || typeof url !== "string") return null;

  const marker = "/storage/v1/object/public/";
  const index = url.indexOf(marker);
  if (index === -1) return null;

  const path = url.slice(index + marker.length);
  const slashIndex = path.indexOf("/");
  return slashIndex === -1 ? null : path.slice(slashIndex + 1);
}

export default function ImageUploader({
  productId,
  images,
  onChange,
  resourceBasePath = "/api/admin/products",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const isDeleting = useRef(false);

  /* ----------------------------------------------
      UPLOAD IMAGE
  ---------------------------------------------- */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      setUploading(true);

      try {
        const file = acceptedFiles[0];
        const form = new FormData();
        form.append("file", file);
        form.append("product_id", productId);

        const res = await fetch(
          `${window.location.origin}${resourceBasePath}/upload-image`,
          {
            method: "POST",
            body: form,
          }
        );

        const json = await res.json();

        if (!json.image) {
          alert(json.error || "Upload failed");
          return;
        }

        onChange([...images, json.image]);
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploading(false);
      }
    },
    [productId, images, onChange, resourceBasePath]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  /* ----------------------------------------------
      DELETE IMAGE
  ---------------------------------------------- */
  async function deleteImage(img: any) {
    try {
      isDeleting.current = true;

      const filePath = extractFilePath(img);
      if (!filePath) {
        alert("Unable to determine file path for this image.");
        return;
      }

      const res = await fetch(
        `${window.location.origin}${resourceBasePath}/delete-image`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: img.id,
            file_path: filePath,
          }),
        }
      );

      const json = await res.json();

      if (!json.success) {
        alert(json.error || "Failed to delete image");
        return;
      }

      onChange(images.filter((i) => i.id !== img.id));
    } finally {
      setTimeout(() => (isDeleting.current = false), 300);
    }
  }

  /* ----------------------------------------------
      SORT HANDLER
  ---------------------------------------------- */
  async function handleSort(newList: any[]) {
    if (isDeleting.current) return;

    onChange(newList);

    await fetch(
      `${window.location.origin}${resourceBasePath}/${productId}/update-images`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: newList.map((img, index) => ({
            id: img.id,
            sort_order: index,
          })),
        }),
      }
    );
  }

  /* ----------------------------------------------
      JSX
  ---------------------------------------------- */
  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-10 rounded-lg text-center cursor-pointer transition
        ${isDragActive ? "bg-blue-50 border-blue-500" : "border-gray-300"}
      `}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-blue-600 font-semibold">Uploading…</p>
        ) : (
          <>
            <p className="text-lg text-gray-700">Drag & drop an image</p>
            <p className="text-sm text-gray-500">or click to browse</p>
          </>
        )}
      </div>

      <ReactSortable
        list={images}
        setList={handleSort}
        animation={200}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {images.map((img) => (
          <div
            key={img.id}
            className="relative border rounded overflow-hidden bg-white shadow-sm"
          >
            <Image
              src={img.url}
              alt=""
              width={300}
              height={300}
              className="w-full h-40 object-cover"
            />

            <button
              onClick={() => deleteImage(img)}
              className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
            >
              ✕
            </button>

            <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-xs py-1 text-center cursor-move">
              Drag to reorder
            </div>
          </div>
        ))}
      </ReactSortable>
    </div>
  );
}
