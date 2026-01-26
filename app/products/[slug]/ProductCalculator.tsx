"use client";

import { useState } from "react";

export default function ProductCalculator({ product }: { product: any }) {
  const [area, setArea] = useState("");
  const [items, setItems] = useState(1);
  const [tilesNeeded, setTilesNeeded] = useState(0);
  const [boxesNeeded, setBoxesNeeded] = useState(0);

  const tilePrice = product.price_per_tile ?? 0;
  const boxPrice = product.price_per_box ?? 0;
  const m2Price = product.price_per_m2 ?? 0;

  const tilesPerBox = product.tiles_per_box ?? 1;
  const coveragePerBox = product.box_coverage_m2 ?? 1;

  // -------------------------------------------------------------
  // CALCULATION
  // -------------------------------------------------------------
  function computeByArea() {
    if (!area) return;

    const areaNum = parseFloat(area);
    const requiredBoxes = Math.ceil(areaNum / coveragePerBox);
    const requiredTiles = requiredBoxes * tilesPerBox;

    setBoxesNeeded(requiredBoxes);
    setTilesNeeded(requiredTiles);
  }

  function incrementItems() {
    setItems((n) => n + 1);
  }

  function decrementItems() {
    setItems((n) => (n > 1 ? n - 1 : 1));
  }

  const totalPrice = items * boxPrice;

  return (
    <div className="mt-6 border rounded-lg p-6 bg-white shadow-sm">

      <h2 className="text-xl font-bold mb-4">Product Calculator</h2>

      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
        To calculate the area required, measure the length and width of the room/wall in 
        metres and multiply them (so length × width). Please also allow for wastage 
        by adding an extra 10% to your calculation.
      </p>

      {/* -------------------------------------------------------------
         AREA INPUT
      ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

        {/* Area */}
        <div>
          <label className="text-sm font-medium">Area Required (m²):</label>
          <input
            type="number"
            min="0"
            className="w-full border p-3 mt-1 rounded"
            placeholder="e.g. 15"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
        </div>

        {/* Tiles Needed */}
        <div>
          <label className="text-sm font-medium">Number Of Items:</label>
          <input
            className="w-full border p-3 mt-1 rounded bg-gray-100"
            readOnly
            value={tilesNeeded}
          />
        </div>

        {/* Boxes Needed */}
        <div>
          <label className="text-sm font-medium">Number Of Boxes:</label>
          <input
            className="w-full border p-3 mt-1 rounded bg-gray-100"
            readOnly
            value={boxesNeeded}
          />
        </div>
      </div>

      <button
        onClick={computeByArea}
        className="w-full bg-black text-white py-3 rounded mb-6"
      >
        Calculate
      </button>

      {/* -------------------------------------------------------------
         PRICE OPTIONS
      ------------------------------------------------------------- */}
      <div className="space-y-3 mb-6">

        <div className="flex items-center gap-3">
          <span className="w-4 h-4 bg-blue-600 rounded"></span>
          <span className="text-gray-700">£{tilePrice} per item</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-4 h-4 bg-purple-600 rounded"></span>
          <span className="text-gray-700">£{m2Price} per m²</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-4 h-4 bg-indigo-600 rounded"></span>
          <span className="text-gray-700">£{boxPrice} per box</span>
        </div>

      </div>

      {/* -------------------------------------------------------------
         QUANTITY SELECTOR + ADD TO BASKET
      ------------------------------------------------------------- */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={decrementItems}
          className="px-4 py-2 bg-gray-200 rounded text-lg"
        >
          -
        </button>

        <span className="text-xl font-semibold">{items}</span>

        <button
          onClick={incrementItems}
          className="px-4 py-2 bg-gray-200 rounded text-lg"
        >
          +
        </button>

        <button className="ml-auto px-6 py-3 bg-blue-600 text-white rounded">
          Add to Basket
        </button>
      </div>

      <div className="text-lg font-semibold text-gray-800">
        Total Price: £{totalPrice.toFixed(2)} <span className="text-sm">(Inc. VAT)</span>
      </div>

      {/* -------------------------------------------------------------
         ORDER SAMPLE
      ------------------------------------------------------------- */}
      <button className="w-full mt-6 py-3 bg-black text-white rounded">
        ORDER A SAMPLE
      </button>

      <p className="text-gray-500 text-sm mt-2">
        Samples are £10 each with free postage.  
        Samples are small cut pieces for colour representation only.
      </p>

    </div>
  );
}
