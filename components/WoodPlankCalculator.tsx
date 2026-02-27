"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const areaNum = Number(area);

    if (!areaNum || areaNum <= 0 || safeCoverage <= 0 || safePrice <= 0) {
      setPacksNeeded(0);
      setAreaWithWaste(0);
      return;
    }

    const calculatedArea = areaNum * 1.1; // 10% wastage
    const packs = Math.ceil(calculatedArea / safeCoverage);

    setPacksNeeded(packs);
    setAreaWithWaste(calculatedArea);
  }, [area, safeCoverage, safePrice]);

  const totalPrice = packsNeeded > 0 ? packsNeeded * safePrice : 0;

  function handleAddToCart() {
    if (packsNeeded <= 0 || areaWithWaste <= 0) return;
    onChange({ boxes: packsNeeded, areaWithWaste });
  }

  return (
    <div className="border border-[#E8E5E0] bg-white p-6">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-5">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">
          Pack Calculator
        </p>
        <div className="flex-1 h-px bg-[#E8E5E0]" />
      </div>

      <p className="text-xs text-[#9A7A5E] mb-5 leading-relaxed">
        A fixed 10% allowance for wastage is automatically applied. Packs cannot be split.
      </p>

      {/* Area input */}
      <div className="mb-6">
        <label className="text-[10px] tracking-widest uppercase text-[#9A7A5E]">
          Area Required
        </label>
        <div className="relative mt-1.5">
          <input
            type="number"
            min="0"
            step="0.01"
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

      {/* Results */}
      {packsNeeded > 0 ? (
        <div className="mb-6 pt-5 border-t border-[#E8E5E0] grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#9A7A5E] mb-1.5">Packs</p>
            <p className="text-xl font-light text-[#1A1A1A]">{packsNeeded}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#9A7A5E] mb-1.5">Total</p>
            <p className="text-xl font-light text-[#1A1A1A]">
              £{totalPrice.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      ) : (
        <p className="mb-6 text-xs text-[#C4BFB9] italic">
          Enter your area above — packs and price update automatically.
        </p>
      )}

      {/* Add to basket */}
      <button
        onClick={handleAddToCart}
        disabled={packsNeeded <= 0}
        className="w-full py-4 bg-[#1A1A1A] text-white text-xs tracking-[0.3em] uppercase hover:bg-[#2A2A2A] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Add to Basket
      </button>
    </div>
  );
}
