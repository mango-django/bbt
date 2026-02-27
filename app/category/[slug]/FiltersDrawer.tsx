"use client";

import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiMenu } from "react-icons/fi";
import FiltersSidebar from "./FiltersSidebar";

export default function FiltersDrawer({
  categorySlug,
  basePath,
}: {
  categorySlug: string;
  basePath?: string;
}) {
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
      {/* FILTER TOGGLE TAB (mobile / tablet) */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="md:hidden fixed top-1/2 -translate-y-1/2 z-[60] bg-gray-300 text-gray-700 rounded-r-lg px-2 py-3 shadow-md border border-gray-400 border-l-0 transition-colors hover:bg-gray-200"
        style={{ left: open ? "min(85vw, 24rem)" : "0" }}
        aria-label={open ? "Close filters" : "Open filters"}
      >
        <span className="flex items-center gap-1">
          <FiMenu size={15} />
          {open ? <FiChevronLeft size={15} /> : <FiChevronRight size={15} />}
        </span>
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
          <FiltersSidebar categorySlug={categorySlug} basePath={basePath} />
        </div>
      </aside>
    </>
  );
}
