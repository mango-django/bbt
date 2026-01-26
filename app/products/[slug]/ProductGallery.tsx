"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImage = {
  id?: string | number;
  url?: string | null;
};

export default function ProductGallery({
  images,
  productTitle,
}: {
  images: ProductImage[];
  productTitle: string;
}) {
  const validImages = images?.filter((img) => !!img?.url) ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = validImages[activeIndex];

  return (
    <div>
      <div className="w-full border rounded-lg overflow-hidden bg-white">
        {activeImage ? (
          <Image
            src={activeImage.url as string}
            alt={`${productTitle} image ${activeIndex + 1}`}
            width={1000}
            height={1000}
            className="object-cover w-full"
          />
        ) : (
          <div className="w-full h-96 bg-gray-200" />
        )}
      </div>

      {validImages.length > 0 && (
        <div className="flex gap-3 mt-4 overflow-x-auto">
          {validImages.map((img, idx) => (
            <button
              type="button"
              key={img?.id ?? `${idx}-${img?.url}`}
              onClick={() => setActiveIndex(idx)}
              className={`w-24 h-24 border rounded overflow-hidden flex-shrink-0 transition focus:outline-none ${
                idx === activeIndex
                  ? "ring-2 ring-black border-black"
                  : "border-gray-200"
              }`}
            >
              <Image
                src={img.url as string}
                alt={`Thumbnail ${idx + 1}`}
                width={250}
                height={250}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
