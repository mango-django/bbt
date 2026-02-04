"use client";

import { useState, useEffect } from "react";
import FiltersSidebar from "./FiltersSidebar";

export default function FiltersDrawer({ categorySlug }: { categorySlug: string }) {
  const [open, setOpen] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* FILTER BUTTON (mobile / tablet) */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-6 left-6 z-40 bg-black text-white px-5 py-3 rounded-full shadow-lg"
      >
        Filters
      </button>

      {/* BACKDROP */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SLIDE-OUT PANEL */}
      <aside
  className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-50
  transform transition-transform duration-300
  md:hidden
  ${open ? "translate-x-0" : "-translate-x-full"}`}
>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">Filters</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-2xl leading-none"
            aria-label="Close filters"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="overflow-y-auto h-full p-4 pb-24">
          <FiltersSidebar categorySlug={categorySlug} />
        </div>
      </aside>
    </>
  );
}
