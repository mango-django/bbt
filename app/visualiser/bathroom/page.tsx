"use client";

import { useEffect, useState } from "react";
import { initBathroom, destroyBathroom } from "../engines/bathroom.engine";

export default function BathroomVisualiserPage() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initBathroom();
    return () => destroyBathroom();
  }, []);

  useEffect(() => {
    const handleLoaded = () => setIsLoading(false);
    window.addEventListener("bathroom-loaded", handleLoaded);
    return () => {
      window.removeEventListener("bathroom-loaded", handleLoaded);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#f5f5f5] overflow-hidden">

      {isLoading && (
        <div className="fixed inset-0 z-50 bg-white" />
      )}

      {/* ===============================
          ENGINE DISPLAY
      =============================== */}
      <div className="absolute left-0 right-0 bottom-0 -top-24 md:top-0 w-full h-full z-0 bg-gray-100">
        <img
          id="bathroom-wall-layer"
          alt="Wall layer"
          className="absolute inset-0 w-full h-full object-contain z-20 transition-opacity duration-300"
        />
        <img
          id="bathroom-floor-layer"
          alt="Floor layer"
          className="absolute inset-0 w-full h-full object-contain z-10 transition-opacity duration-300"
        />
      </div>

      {/* ===============================
          MAIN LAYOUT
      =============================== */}
      <div className="relative z-20 flex h-full flex-col pointer-events-none">

        {/* ===== Top Bar ===== */}
        <div className="h-16 flex items-center justify-between px-4 border-b bg-[#f5f5f5] pointer-events-auto">
          <button
            onClick={() => setDrawerOpen((open) => !open)}
            className="text-2xl text-gray-700"
          >
            ☰
          </button>

          <button
            onClick={() => history.back()}
            className="px-6 py-1 rounded-full bg-[#5c555b] text-white text-sm"
          >
            Return to Store
          </button>

          <div className="text-xl text-gray-500">⋮</div>
        </div>

        {/* ===============================
            BODY
        =============================== */}
        <div className="flex flex-1 overflow-hidden">

          {/* ===== DESKTOP SIDEBAR ===== */}
          <aside
            className={`hidden md:flex w-[320px] border-r bg-white flex-col pointer-events-auto transition-transform duration-300 ${
              drawerOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0`}
          >
            <SidebarDesktop />
          </aside>

          <div className="flex-1 hidden md:block" />
        </div>

        {/* ===============================
            MOBILE BOTTOM PANEL
        =============================== */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-40 pointer-events-auto">

          <div className="p-4 space-y-4">

            {/* Apply To */}
            <div>
              <div className="text-xs text-gray-500 mb-2 text-center">
                Apply To
              </div>
              <div className="flex gap-2">
                <button data-apply-mode="set" className="flex-1 py-2 border rounded text-xs font-semibold">
                  Set
                </button>
                <button data-apply-mode="walls" className="flex-1 py-2 border rounded text-xs font-semibold">
                  Walls
                </button>
                <button data-apply-mode="floor" className="flex-1 py-2 border rounded text-xs font-semibold">
                  Floor
                </button>
              </div>
            </div>

            {/* Chevron + Name */}
            <div className="flex items-center justify-between">
              <button
                id="bathroom-prev-tile"
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
              >
                ‹
              </button>

              <div
                id="bathroom-active-name"
                className="text-sm font-semibold text-center flex-1 px-2"
              >
                Select Tile
              </div>

              <button
                id="bathroom-next-tile"
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
              >
                ›
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div
              id="bathroom-tile-list-mobile"
              className="overflow-x-auto"
            />

          </div>
        </div>

        {/* ===== Bottom Footer (Desktop Only) ===== */}
        <div className="hidden md:flex h-16 border-t bg-[#f9fafb] items-center justify-between px-6 text-sm pointer-events-auto">
          <div>
            Current selection:{" "}
            <span id="option-placeholder" className="font-semibold">
              -
            </span>
          </div>
          <div className="text-gray-500">
            Powered by <strong>Plan Vector</strong>
          </div>
        </div>

      </div>
    </div>
  );
}

/* =====================================================
   DESKTOP SIDEBAR
===================================================== */

function SidebarDesktop() {
  const [activeTileName, setActiveTileName] = useState("Select a tile");

  useEffect(() => {
    const handleActiveTile = (e: Event) => {
      const detail = (e as CustomEvent<{ name: string }>).detail;
      if (detail?.name) setActiveTileName(detail.name);
    };
    window.addEventListener("bathroom-active-tile", handleActiveTile);
    return () =>
      window.removeEventListener("bathroom-active-tile", handleActiveTile);
  }, []);

  const nextView = () => (window as any).bathroomCycleNext?.();
  const prevView = () => (window as any).bathroomCyclePrev?.();

  return (
    <>
      <div className="p-4 border-b">
        <input
          id="bathroom-search"
          placeholder="Search tiles..."
          className="w-full px-4 py-2 text-sm rounded-full border"
        />
      </div>

      <div className="px-4 py-4 border-b">
        <div className="flex items-center gap-3">
          <button
            className="w-8 h-8 rounded-full border bg-white"
            onClick={prevView}
          >
            ‹
          </button>
          <div className="flex-1 text-center text-sm font-semibold">
            {activeTileName}
          </div>
          <button
            className="w-8 h-8 rounded-full border bg-white"
            onClick={nextView}
          >
            ›
          </button>
        </div>
      </div>

      <div className="px-4 py-3 border-b">
        <div className="text-xs font-semibold mb-2">Apply To</div>
        <div className="grid grid-cols-3 gap-2">
          <button data-apply-mode="set" className="px-2 py-1 text-xs rounded border bg-white">
            Set
          </button>
          <button data-apply-mode="walls" className="px-2 py-1 text-xs rounded border bg-white">
            Walls
          </button>
          <button data-apply-mode="floor" className="px-2 py-1 text-xs rounded border bg-white">
            Floor
          </button>
        </div>
      </div>

      <div
        id="bathroom-tile-list-desktop"
        className="flex-1 overflow-y-auto p-4 space-y-3"
      />
    </>
  );
}
