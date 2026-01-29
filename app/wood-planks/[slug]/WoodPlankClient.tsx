"use client";

import { useCart } from "@/app/context/CartContext";
import ProductGallery from "@/components/ProductGallery";
import WoodPlankCalculator from "@/components/WoodPlankCalculator";

export default function WoodPlankClient({ plank }: { plank: any }) {
  const { addItem } = useCart();

  const images = Array.isArray(plank.images)
    ? plank.images.map((url: string) => ({ url }))
    : [];

  function handleAddToBasket(boxes: number, areaWithWaste: number) {
  addItem({
    product_id: plank.id,
    title: plank.title,
    image: images[0]?.url ?? "",
    productType: "wood_plank",

    price_per_box: plank.price_per_box,
    boxes,
    coverage: plank.coverage_per_box,
    m2: areaWithWaste,

    boxWeight: Number(plank.weight_per_box) || 0, // ✅ THIS IS THE KEY LINE

    quantity: 1,
  });

  alert("Added to basket!");
}


  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
        <ProductGallery images={images} title={plank.title} />

        <div>
          <h1 className="text-3xl font-bold mb-4">{plank.title}</h1>

          <p className="text-2xl font-semibold mb-6">
            £{plank.price_per_box} / box
          </p>

          <p className="text-gray-600 mb-6">
            {plank.description}
          </p>

          <WoodPlankCalculator
            coveragePerBox={plank.coverage_per_box}
            pricePerBox={plank.price_per_box}
            onChange={({ boxes, areaWithWaste }) =>
              handleAddToBasket(boxes, areaWithWaste)
            }
          />

          <div className="mt-8 border border-gray-200">
            <table className="w-full text-sm">
              <tbody>
                <Row
                  label="Coverage per Box"
                  value={`${plank.coverage_per_box} m²`}
                />
                <Row
                  label="Plank Length"
                  value={`${plank.plank_length_mm} mm`}
                />
                <Row
                  label="Plank Width"
                  value={`${plank.plank_width_mm} mm`}
                />
                <Row
                  label="Thickness"
                  value={`${plank.thickness_mm} mm`}
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <tr className="border-b">
      <td className="p-3 font-medium">{label}</td>
      <td className="p-3">{value ?? "—"}</td>
    </tr>
  );
}
