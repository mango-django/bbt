"use client";

import { useEffect } from "react";
import { initBathroom, destroyBathroom } from "./bathroom.engine";

export default function BathroomVisualiser() {
  useEffect(() => {
    initBathroom();
    return () => destroyBathroom();
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">

      {/* ===============================
          MAIN DISPLAY AREA
      =============================== */}
      <div className="relative w-full h-full bg-gray-200">
        <div className="relative w-full h-full">

          <img
            id="bathroom-wall-layer"
            className="absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-500"
            src="/visualiser/bathroom/base_walls.png"
            alt="Walls"
          />

          <img
            id="bathroom-floor-layer"
            className="absolute inset-0 w-full h-full object-cover z-20 transition-opacity duration-500"
            src="/visualiser/bathroom/base_floor.png"
            alt="Floors"
          />

        </div>
      </div>

      {/* ===============================
          DESKTOP PANEL
      =============================== */}
      <div className="hidden md:flex absolute top-0 right-0 w-[400px] h-full border-l bg-white flex-col z-40">

        <div className="p-4 border-b">
          <input
            id="bathroom-search"
            type="text"
            placeholder="Search tiles..."
            className="w-full p-2 border rounded"
          />

          <div className="flex gap-2 mt-4">
            <button data-apply-mode="set" className="flex-1 p-2 bg-black text-white text-xs font-bold rounded">SET</button>
            <button data-apply-mode="walls" className="flex-1 p-2 bg-gray-200 text-xs font-bold rounded">WALLS</button>
            <button data-apply-mode="floor" className="flex-1 p-2 bg-gray-200 text-xs font-bold rounded">FLOOR</button>
          </div>
        </div>

        {/* 🔥 Desktop Container */}
        <div
          id="bathroom-tile-list-desktop"
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
        />
      </div>

      {/* ===============================
          MOBILE PANEL
      =============================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 shadow-2xl">

        <div className="p-4">

          <div className="text-xs text-gray-500 mb-2 text-center">
            Apply To
          </div>

          <div className="flex gap-2 mb-4">
            <button data-apply-mode="set" className="flex-1 p-2 border rounded text-xs font-semibold">Set</button>
            <button data-apply-mode="walls" className="flex-1 p-2 border rounded text-xs font-semibold">Walls</button>
            <button data-apply-mode="floor" className="flex-1 p-2 border rounded text-xs font-semibold">Floor</button>
          </div>

          <div className="flex items-center justify-between mb-3">

            <button
              id="bathroom-prev-tile"
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg"
            >
              ‹
            </button>

            <div
              id="bathroom-active-name"
              className="font-semibold text-sm text-center flex-1 px-2 truncate"
            >
              Select Tile
            </div>

            <button
              id="bathroom-next-tile"
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg"
            >
              ›
            </button>
          </div>

          {/* 🔥 Mobile Container */}
          <div
            id="bathroom-tile-list-mobile"
            className="overflow-x-auto"
          />
        </div>
      </div>

    </div>
  );
}
