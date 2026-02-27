import Link from "next/link";
import Image from "next/image";

export default function InstallationProductCard({ product }: any) {
  const images = Array.isArray(product.installation_product_images)
    ? [...product.installation_product_images].sort(
        (a: any, b: any) => (a?.sort_order ?? 999) - (b?.sort_order ?? 999)
      )
    : [];
  const firstImage = images[0]?.url ?? null;
  const priceValue = Number(product?.price);
  const formattedPrice = Number.isFinite(priceValue) ? priceValue.toFixed(2) : null;

  return (
    <Link href={`/installation-products/${product.id}`} className="group block">

      {/* Image — 1:1 square */}
      <div className="relative w-full overflow-hidden bg-[#EEECE9]" style={{ aspectRatio: "1 / 1" }}>
        {firstImage ? (
          <Image
            src={firstImage}
            alt={product.name}
            fill
            className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#C4BFB9]">No Image</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="mt-3 px-0.5">
        {product.product_type && (
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] mb-1">
            {product.product_type}
          </p>
        )}
        <p className="text-sm text-[#1A1A1A] font-light leading-snug tracking-wide">
          {product.name}
        </p>
        {formattedPrice && (
          <p className="mt-1 text-xs text-[#6B6B6B] tracking-wide">
            £{formattedPrice}
          </p>
        )}
      </div>

    </Link>
  );
}
