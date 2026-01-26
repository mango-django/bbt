"use client";

import Image from "next/image";
import { useState } from "react";

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

  const fallbackImage = "/hero-bathroom.webp";
  const selectedImage = validImages[selectedIndex]?.url ?? fallbackImage;

  return (
    <div>
      <div className="w-full border border-gray-200 rounded-none overflow-hidden bg-white aspect-square flex items-center justify-center">
        <Image
          key={selectedImage}
          src={selectedImage}
          alt={title}
          width={1000}
          height={1000}
          className="object-contain w-full h-full"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="flex gap-3 mt-4 overflow-x-auto">
        {validImages.map((img, index) => (
          <button
            key={img.id ?? `${index}-${img.url}`}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={`w-24 h-24 border rounded-none overflow-hidden ${
              selectedIndex === index ? "border-neutral-900" : "border-gray-200"
            }`}
          >
            <Image
              src={img.url ?? fallbackImage}
              alt={`Thumbnail ${index + 1}`}
              width={250}
              height={250}
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
