"use client";

import { useEffect, useState } from "react";
import { initBathroomFloors, destroyBathroomFloors } from "../engines/bathroom-floors.engine";

export default function BathroomFloorsVisualiserPage() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    initBathroomFloors();
    return () => destroyBathroomFloors();
  }, []);

  useEffect(() => {
    const handleProgress = (e: Event) => {
      const detail = (e as CustomEvent<{ progress: number }>).detail;
      if (!detail) return;
      setLoadingProgress(detail.progress);
      if (detail.progress >= 100) setIsLoading(false);
    };
    const handleLoaded = () => setIsLoading(false);
    window.addEventListener("bf-progress", handleProgress);
    window.addEventListener("bf-loaded", handleLoaded);
    return () => {
      window.removeEventListener("bf-progress", handleProgress);
      window.removeEventListener("bf-loaded", handleLoaded);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#EEECE9] overflow-hidden">

      {/* Loading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div
          className={`h-0.5 bg-[#9A7A5E] transition-all duration-300 ${
            isLoading ? "opacity-100" : "opacity-0"
          }`}
          style={{ width: `${loadingProgress}%` }}
        />
      </div>

      {/* Two stacked floor image layers for crossfade */}
      <div className="absolute left-0 right-0 bottom-0 -top-24 md:top-0 w-full h-full z-0">
        <img
          id="bf-floor-layer-back"
          alt=""
          className="absolute inset-0 w-full h-full object-contain z-10"
        />
        <img
          id="bf-floor-layer-front"
          alt="Bathroom floor visualisation"
          className="absolute inset-0 w-full h-full object-contain z-20 transition-opacity duration-500"
        />
      </div>

      {/* Main layout */}
      <div className="relative z-20 flex h-full flex-col pointer-events-none">

        {/* Top bar */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-[#D4CFC8] bg-[#FAFAF8]/95 backdrop-blur-sm pointer-events-auto shrink-0">
          <button
            onClick={() => setDrawerOpen((open) => !open)}
            className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 text-[#1A1A1A]"
            aria-label="Toggle tile panel"
          >
            <span className="block w-5 h-px bg-current" />
            <span className="block w-5 h-px bg-current" />
            <span className="block w-5 h-px bg-current" />
          </button>

          <p className="text-[10px] tracking-[0.3em] uppercase text-[#9A7A5E] font-medium">
            25 Popular Bathroom Floor Tiles
          </p>

          <button
            onClick={() => history.back()}
            className="text-[10px] tracking-[0.25em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:text-[#9A7A5E] hover:border-[#9A7A5E] transition-colors"
          >
            Return to Store
          </button>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden px-4 py-2.5 border-b border-[#D4CFC8] bg-[#FAFAF8]/95 pointer-events-auto shrink-0">
          <div className="relative">
            <input
              id="bf-search-mobile-top"
              placeholder="Search tiles..."
              className="w-full border-0 border-b border-[#D4CFC8] pb-2 pt-1 pr-6 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] transition-colors placeholder-[#C4C0BB] text-[#1A1A1A]"
            />
            <span className="absolute right-0 bottom-2.5 text-[#9A7A5E] pointer-events-none">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Desktop sidebar */}
          <aside
            className={`hidden md:flex w-[300px] border-r border-[#D4CFC8] bg-[#FAFAF8] flex-col pointer-events-auto transition-transform duration-300 shrink-0 ${
              drawerOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <SidebarDesktop />
          </aside>

          <div className="flex-1 hidden md:block" />
        </div>

        {/* Mobile bottom panel */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FAFAF8] border-t border-[#D4CFC8] shadow-2xl z-40 pointer-events-auto">
          <div className="p-4 space-y-4">

            {/* Prev / tile name / Next */}
            <div className="flex items-center justify-between gap-3">
              <button
                id="bf-prev-tile"
                className="w-9 h-9 border border-[#D4CFC8] flex items-center justify-center text-[#9A7A5E] hover:border-[#9A7A5E] transition-colors shrink-0"
                aria-label="Previous tile"
              >
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden>
                  <path d="M7 1L1 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div
                id="bf-active-name"
                className="text-xs tracking-wide text-[#1A1A1A] text-center flex-1 truncate font-light"
              >
                Select a Tile
              </div>

              <button
                id="bf-next-tile"
                className="w-9 h-9 border border-[#D4CFC8] flex items-center justify-center text-[#9A7A5E] hover:border-[#9A7A5E] transition-colors shrink-0"
                aria-label="Next tile"
              >
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden>
                  <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Mobile thumbnail strip */}
            <div id="bf-tile-list-mobile" className="overflow-x-auto" />

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
    window.addEventListener("bf-active-tile", handleActiveTile);
    return () =>
      window.removeEventListener("bf-active-tile", handleActiveTile);
  }, []);

  const nextView = () => (window as any).bfCycleNext?.();
  const prevView = () => (window as any).bfCyclePrev?.();

  return (
    <>
      {/* Search */}
      <div className="px-5 py-4 border-b border-[#E8E5E0]">
        <div className="relative">
          <input
            id="bf-search"
            placeholder="Search tiles..."
            className="w-full border-0 border-b border-[#D4CFC8] pb-2 pt-1 pr-6 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] transition-colors placeholder-[#C4C0BB] text-[#1A1A1A]"
          />
          <span className="absolute right-0 bottom-2.5 text-[#9A7A5E] pointer-events-none">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
              <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>

      {/* Active tile + nav */}
      <div className="px-5 py-3 border-b border-[#E8E5E0]">
        <div className="flex items-center gap-3">
          <button
            onClick={prevView}
            className="w-8 h-8 border border-[#D4CFC8] flex items-center justify-center text-[#9A7A5E] hover:border-[#9A7A5E] transition-colors shrink-0"
            aria-label="Previous tile"
          >
            <svg width="6" height="11" viewBox="0 0 6 11" fill="none" aria-hidden>
              <path d="M5 1L1 5.5L5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex-1 text-center text-xs tracking-wide text-[#1A1A1A] font-light truncate">
            {activeTileName}
          </div>
          <button
            onClick={nextView}
            className="w-8 h-8 border border-[#D4CFC8] flex items-center justify-center text-[#9A7A5E] hover:border-[#9A7A5E] transition-colors shrink-0"
            aria-label="Next tile"
          >
            <svg width="6" height="11" viewBox="0 0 6 11" fill="none" aria-hidden>
              <path d="M1 1L5 5.5L1 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Tile list */}
      <div
        id="bf-tile-list-desktop"
        className="flex-1 overflow-y-auto"
      />
    </>
  );
}
