import Link from "next/link";
import Image from "next/image";

export default function InstallationProductCard({ product }: any) {
  const firstImage = product.installation_product_images?.[0]?.url;
  const priceValue = Number(product?.price);
  const formattedPrice = Number.isFinite(priceValue)
    ? priceValue.toFixed(2)
    : null;

  return (
    <Link
      href={`/installation-products/${product.id}`}
      className="border border-gray-200 rounded shadow-sm hover:shadow-md transition block"
    >
      {firstImage ? (
        <div className="relative w-full pt-[100%] rounded-t overflow-hidden bg-gray-50">
          <Image
            src={firstImage}
            alt={product.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </div>
      ) : (
        <div className="w-full pt-[100%] bg-gray-100 flex items-center justify-center rounded-t">
          <span className="text-gray-400">No Image</span>
        </div>
      )}

      <div className="p-4 space-y-1">
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-sm text-gray-500 capitalize">{product.product_type}</p>
        <p className="font-medium text-blue-600">
          {formattedPrice ? `£${formattedPrice}` : "—"}
        </p>
      </div>
    </Link>
  );
}
