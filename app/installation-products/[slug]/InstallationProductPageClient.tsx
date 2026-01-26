"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import ProductGallery from "@/components/ProductGallery";

/* =============================================================
   INSTALLATION PRODUCT PAGE CLIENT
   ============================================================= */
type InstallationProductPageClientProps = {
  product: any;
  images: Array<{ url?: string } | null>;
};

export default function InstallationProductPageClient({
  product,
  images,
}: InstallationProductPageClientProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  /* ----------------------------------------------
     NORMALISED VALUES
     ---------------------------------------------- */
  const price_each =
    Number(product?.price ?? product?.unit_price ?? product?.unit_amount ?? 0);

  const weight_each =
    Number(product?.weight ?? product?.item_weight ?? product?.unit_amount ?? 0);

  const normalizedImages = Array.isArray(images)
    ? images
        .filter(
          (img): img is { url?: string } =>
            !!img && typeof img === "object"
        )
        .map((img) => ({
          ...img,
          url: typeof img.url === "string" ? img.url : undefined,
        }))
    : [];

  const coverImage =
    normalizedImages.find((img) => img.url)?.url ||
    product?.main_image ||
    product?.image ||
    "/hero-placeholder.jpg";

  /* ----------------------------------------------
     ADD TO CART (installation format)
     ---------------------------------------------- */
  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      title: product.name,
      image: coverImage,

      productType: "installation",

      price_each,
      quantity,

      boxWeight: weight_each,

      m2: 0,
      coverage: 1,
      finish: undefined,
    });

    alert("Added to basket!");
  };

  /* ----------------------------------------------
     RENDER VIEW
     ---------------------------------------------- */
  return (
    <div className="min-h-screen bg-white text-[#1f1f1f]">
      <div className="max-w-5xl mx-auto p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ProductGallery
            images={normalizedImages}
            title={product?.name ?? "Installation Product"}
          />

          <div>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

            {product.description && (
              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="text-2xl font-semibold text-blue-600 mb-6">
              £{price_each.toFixed(2)}
            </div>

            {/* QUANTITY SELECTOR */}
            <div className="mb-6">
              <label className="block font-medium mb-1">Quantity</label>
              <div className="flex items-center border border-gray-300 w-fit rounded">
                <button
                  className="px-3 py-2"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  –
                </button>

                <div className="px-4 py-2">{quantity}</div>

                <button
                  className="px-3 py-2"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* ADD TO CART */}
            <button
              className="w-full py-3 bg-blue-600 text-white rounded-lg mt-4"
              onClick={handleAddToCart}
            >
              Add to Basket
            </button>

            {/* PRODUCT DETAILS */}
            <div className="mt-10 border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <DetailRow label="Type" value={product.product_type} />
                  <DetailRow label="Colour" value={product.colour} />
                  <DetailRow
                    label="Weight"
                    value={
                      weight_each
                        ? `${weight_each}${(product.unit_type ?? "").toUpperCase()}`
                        : "—"
                    }
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------
   ROW COMPONENT
   ---------------------------------------------- */
function DetailRow({ label, value }: { label: string; value?: any }) {
  return (
    <tr className="border-b">
      <td className="p-3 font-medium text-gray-700">{label}</td>
      <td className="p-3 text-gray-900">{value ?? "—"}</td>
    </tr>
  );
}
