"use client";

import { useState } from "react";
import BrandedTileFallback from "./BrandedTileFallback";

/**
 * Product thumbnail <img> that degrades to a branded placeholder when there is
 * no `src` or the image fails to load (404, network error). Drop-in replacement
 * for a plain <img> inside a `position: relative` container.
 */
export default function ProductImage({
  src,
  alt = "",
  className = "",
}: {
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <BrandedTileFallback />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
