"use client";

import Link from "next/link";

export interface InstallationProduct {
  id: string;
  name: string;
  slug: string;
  product_type: string;
  colour: string | null;
  unit_type: string | null; // "kg" | "litre"
  unit_amount: string | null; 
  price: number;
  installation_product_images?: { url: string }[];
}

export default function ProductCard({ product }: { product: InstallationProduct }) {
  const img = product.installation_product_images?.[0]?.url ?? null;

  return (
    <Link
      href={`/installation-products/${product.id}`}
      className="border rounded overflow-hidden bg-white hover:shadow-lg transition block"
    >
      {/* IMAGE */}
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
        {img ? (
          <img
            src={img}
            className="object-cover w-full h-full"
            alt={product.name}
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>

        <p className="text-sm text-gray-600 capitalize">{product.product_type}</p>

        {(product.unit_amount && product.unit_type) && (
          <p className="text-sm text-gray-600">
            {product.unit_amount} {product.unit_type}
          </p>
        )}

        <p className="font-bold mt-2">£{product.price}</p>
      </div>
    </Link>
  );
}
