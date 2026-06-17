"use client";

import Image from "next/image";
import { useState } from "react";
import BrandedTileFallback from "./BrandedTileFallback";

type GalleryImage = {
  id?: string;
  url?: string | null;
};

export default function ProductGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const validImages = images.filter((img) => !!img?.url);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Track URLs that fail to load so we can swap them for the branded fallback.
  const [errored, setErrored] = useState<Record<string, boolean>>({});

  const selectedUrl = validImages[selectedIndex]?.url ?? null;
  const showFallback = !selectedUrl || errored[selectedUrl];

  return (
    <div>
      {/* Main image */}
      <div
        className="relative w-full bg-[#EEECE9] overflow-hidden"
        style={{ aspectRatio: "1 / 1" }}
      >
        {showFallback ? (
          <BrandedTileFallback />
        ) : (
          <Image
            key={selectedUrl}
            src={selectedUrl as string}
            alt={title}
            fill
            className="object-contain p-6 transition-opacity duration-300"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            onError={() =>
              setErrored((e) => ({ ...e, [selectedUrl as string]: true }))
            }
          />
        )}
      </div>

      {/* Thumbnail strip */}
      {validImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {validImages.map((img, idx) => {
            const url = img.url as string;
            return (
              <button
                key={img.id ?? `${idx}-${url}`}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-20 h-20 shrink-0 overflow-hidden bg-[#EEECE9] transition-all duration-200
                ${
                  selectedIndex === idx
                    ? "ring-1 ring-[#9A7A5E]"
                    : "ring-1 ring-[#E8E5E0] hover:ring-[#C4BFB9]"
                }`}
              >
                {errored[url] ? (
                  <BrandedTileFallback compact />
                ) : (
                  <Image
                    src={url}
                    alt={`View ${idx + 1}`}
                    fill
                    className="object-cover"
                    onError={() =>
                      setErrored((e) => ({ ...e, [url]: true }))
                    }
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
