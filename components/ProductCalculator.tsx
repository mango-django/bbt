"use client";

import { useEffect, useState } from "react";

type Props = {
  product: any;
  onChange?: (data: {
    m2: number;
    boxes: number;
    tiles: number;
  }) => void;
};

export default function ProductCalculator({ product, onChange }: Props) {
  const [area, setArea] = useState("");
  const [tiles, setTiles] = useState(0);
  const [boxes, setBoxes] = useState(0);
  const [wastage, setWastage] = useState(0);

  function compute() {
    const areaNum = Number(area);
    if (!area || Number.isNaN(areaNum)) return;
    if (areaNum <= 0) return;

    const wastagePct = Math.max(0, Number(wastage) || 0);

    // apply wastage
    const requiredM2 = areaNum * (1 + wastagePct / 100);

    const tilesPerBox = Number(product.tiles_per_box) || 0;
    const m2PerBox = Number(product.box_coverage_m2) || 1;

    // calculate boxes and tiles
    const calculatedBoxes = Math.ceil(requiredM2 / m2PerBox);
    const calculatedTiles = tilesPerBox > 0 ? calculatedBoxes * tilesPerBox : 0;

    setBoxes(calculatedBoxes);
    setTiles(calculatedTiles);

    // send structured result to ProductPageClient
    if (onChange) {
      onChange({
        m2: Number(requiredM2.toFixed(2)),
        boxes: calculatedBoxes,
        tiles: calculatedTiles,
      });
    }
  }

  useEffect(() => {
    if (!area) return;
    compute();
  }, [area, wastage, product.tiles_per_box, product.box_coverage_m2]);

  // total price (per box)
  const totalPrice = boxes * (Number(product.price_per_box) || 0);

  return (
    <div className="border border-gray-200 rounded-none p-5 bg-white text-[#1f1f1f]">
      <h3 className="font-semibold text-lg mb-4 text-[#1f1f1f]">
        Tile Calculator
      </h3>

      {/* AREA INPUT */}
      <input
        className="w-full border p-3 mb-3"
        placeholder="Area Required (m²)"
        value={area}
        onChange={(e) => setArea(e.target.value)}
        type="number"
        min="0"
        step="0.1"
      />

      {/* WASTAGE SELECTOR */}
      <select
        className="w-full border p-3 mb-3"
        value={wastage}
        onChange={(e) => setWastage(parseInt(e.target.value))}
      >
        <option value={0}>No Wastage</option>
        <option value={5}>+5% Wastage</option>
        <option value={10}>+10% Wastage</option>
      </select>

      {/* RESULTS */}
      <div className="text-[#333333] space-y-1 mt-4">
        <p>
          <strong>Tiles Needed:</strong> {tiles}
        </p>
        <p>
          <strong>Boxes Needed:</strong> {boxes}
        </p>
        <p>
          <strong>Total Price:</strong> £{totalPrice.toFixed(2)}
        </p>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Use the calculation above before adding to your basket.
      </p>
    </div>
  );
}
