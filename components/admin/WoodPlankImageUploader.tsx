"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";

type Props = {
  plankId: string;
  images: string[];
  onChange: (imgs: string[]) => void;
  resourceBasePath?: string;
};

function extractFilePath(url: string) {
  if (!url || typeof url !== "string") return null;
  const marker = "/storage/v1/object/public/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}

export default function WoodPlankImageUploader({
  plankId,
  images,
  onChange,
  resourceBasePath = "/api/admin/wood-planks",
}: Props) {
  const [uploading, setUploading] = useState(false);

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
        form.append("plank_id", plankId);

        const res = await fetch(
          `${window.location.origin}${resourceBasePath}/upload-image`,
          {
            method: "POST",
            body: form,
          }
        );

        const json = await res.json();

        if (!json.image?.url) {
          alert(json.error || "Upload failed");
          return;
        }

        onChange([...images, json.image.url]);
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploading(false);
      }
    },
    [plankId, images, onChange, resourceBasePath]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  /* ----------------------------------------------
      DELETE IMAGE
  ---------------------------------------------- */
  async function deleteImage(url: string) {
    const filePath = extractFilePath(url);
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
          plank_id: plankId,
          url,
          file_path: filePath,
        }),
      }
    );

    const json = await res.json();

    if (!json.success) {
      alert(json.error || "Failed to delete image");
      return;
    }

    onChange(images.filter((img) => img !== url));
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((url) => (
          <div
            key={url}
            className="relative border rounded overflow-hidden bg-white shadow-sm"
          >
            <Image
              src={url}
              alt=""
              width={300}
              height={300}
              className="w-full h-40 object-cover"
            />

            <button
              onClick={() => deleteImage(url)}
              className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
