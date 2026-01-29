"use client";

import { useEffect, useState } from "react";

export default function WoodPlankCalculator({
  coveragePerBox,
  pricePerBox,
  onChange,
}: {
  coveragePerBox: number;
  pricePerBox: number;
  onChange: (data: { boxes: number; areaWithWaste: number }) => void;
}) {
  const safeCoverage = Number(coveragePerBox) || 0;
  const safePrice = Number(pricePerBox) || 0;

  const [area, setArea] = useState("");
  const [packsNeeded, setPacksNeeded] = useState(0);
  const [areaWithWaste, setAreaWithWaste] = useState(0);

  /* ----------------------------------
     AUTO CALCULATION (SAFE)
  ---------------------------------- */
  useEffect(() => {
    const areaNum = Number(area);

    if (
      !areaNum ||
      areaNum <= 0 ||
      safeCoverage <= 0 ||
      safePrice <= 0
    ) {
      setPacksNeeded(0);
      setAreaWithWaste(0);
      return;
    }

    const calculatedArea = areaNum * 1.1; // 10% wastage
    const packs = Math.ceil(calculatedArea / safeCoverage);

    setPacksNeeded(packs);
    setAreaWithWaste(calculatedArea);
  }, [area, safeCoverage, safePrice]);

  const totalPrice =
    packsNeeded > 0 ? packsNeeded * safePrice : 0;

  /* ----------------------------------
     ADD TO CART
  ---------------------------------- */
  function handleAddToCart() {
    if (packsNeeded <= 0 || areaWithWaste <= 0) return;

    onChange({
      boxes: packsNeeded,
      areaWithWaste,
    });
  }

  return (
    <div className="mt-6 border rounded-lg p-6 bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Calculator</h2>

      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
        Enter the total area required. A fixed 10% allowance for wastage is
        automatically applied. Wood planks are sold per pack and packs cannot be
        split.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* AREA INPUT */}
        <div>
          <label className="text-sm font-medium">
            Area Required (m²)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full border p-3 mt-1 rounded"
            placeholder="e.g. 22.5"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
        </div>

        {/* PACK OUTPUT */}
        <div>
          <label className="text-sm font-medium">
            Packs Required
          </label>
          <input
            readOnly
            className="w-full border p-3 mt-1 rounded bg-gray-100 font-semibold"
            value={packsNeeded || ""}
            placeholder="—"
          />
        </div>
      </div>

      {/* PRICE */}
      <div className="text-lg font-semibold text-gray-800 mb-6">
        Total Price:{" "}
        <span>
          £{totalPrice.toLocaleString("en-GB", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={handleAddToCart}
        className="w-full bg-black text-white py-3 rounded"
        disabled={packsNeeded <= 0}
      >
        Add to Cart
      </button>
    </div>
  );
}
