"use client";

import { useEffect, useState } from "react";

type Props = {
  product: any;
  onChange?: (data: { m2: number; boxes: number; tiles: number }) => void;
};

function Chevron() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
      <path
        d="M1 1L5 5L9 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProductCalculator({ product, onChange }: Props) {
  const [area, setArea] = useState("");
  const [wastage, setWastage] = useState(10);
  const [tiles, setTiles] = useState(0);
  const [boxes, setBoxes] = useState(0);

  function compute() {
    const areaNum = Number(area);
    if (!area || Number.isNaN(areaNum) || areaNum <= 0) return;

    const wastagePct = Math.max(0, Number(wastage) || 0);
    const requiredM2 = areaNum * (1 + wastagePct / 100);
    const tilesPerBox = Number(product.tiles_per_box) || 0;
    const m2PerBox = Number(product.box_coverage_m2) || 1;
    const calculatedBoxes = Math.ceil(requiredM2 / m2PerBox);
    const calculatedTiles = tilesPerBox > 0 ? calculatedBoxes * tilesPerBox : 0;

    setBoxes(calculatedBoxes);
    setTiles(calculatedTiles);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, wastage, product.tiles_per_box, product.box_coverage_m2]);

  const totalPrice = boxes * (Number(product.price_per_box) || 0);
  const hasResults = boxes > 0;

  return (
    <div className="border border-[#E8E5E0] bg-white p-6">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-5">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">
          Tile Calculator
        </p>
        <div className="flex-1 h-px bg-[#E8E5E0]" />
      </div>

      <div className="space-y-5">

        {/* Area input */}
        <div>
          <label className="text-[10px] tracking-widest uppercase text-[#9A7A5E]">
            Area Required
          </label>
          <div className="relative mt-1.5">
            <input
              type="number"
              min="0"
              step="0.1"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="0.00"
              className="w-full border-0 border-b border-[#D4CFC8] pb-2 pt-1 pr-10 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] transition-colors placeholder-[#C4C0BB] text-[#1A1A1A]"
            />
            <span className="absolute right-0 bottom-2.5 text-[10px] tracking-widest uppercase text-[#9A7A5E] pointer-events-none">
              m²
            </span>
          </div>
        </div>

        {/* Wastage selector */}
        <div>
          <label className="text-[10px] tracking-widest uppercase text-[#9A7A5E]">
            Wastage Allowance
          </label>
          <div className="relative mt-1.5">
            <select
              value={wastage}
              onChange={(e) => setWastage(parseInt(e.target.value))}
              className="appearance-none w-full border-0 border-b border-[#D4CFC8] pb-2 pt-1 pr-8 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] cursor-pointer transition-colors text-[#1A1A1A]"
            >
              <option value={0}>No Wastage</option>
              <option value={5}>+5% Wastage</option>
              <option value={10}>+10% Wastage (Recommended)</option>
              <option value={15}>+15% Wastage</option>
            </select>
            <span className="pointer-events-none absolute right-0 bottom-2.5 text-[#9A7A5E]">
              <Chevron />
            </span>
          </div>
        </div>

      </div>

      {/* Results */}
      {hasResults ? (
        <div className="mt-6 pt-5 border-t border-[#E8E5E0] grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#9A7A5E] mb-1.5">Tiles</p>
            <p className="text-xl font-light text-[#1A1A1A]">{tiles}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#9A7A5E] mb-1.5">Boxes</p>
            <p className="text-xl font-light text-[#1A1A1A]">{boxes}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#9A7A5E] mb-1.5">Total</p>
            <p className="text-xl font-light text-[#1A1A1A]">£{totalPrice.toFixed(2)}</p>
          </div>
        </div>
      ) : (
        <p className="mt-5 text-xs text-[#C4BFB9] italic">
          Enter your area above — results update automatically.
        </p>
      )}
    </div>
  );
}
