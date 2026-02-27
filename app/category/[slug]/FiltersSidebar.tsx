"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type TileSize = {
  id: string;
  label: string;
};

/* -------------------------------------------------------
   Shared sub-components
------------------------------------------------------- */

function Chevron() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-3">
      <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium">
        {label}
      </p>
      <div className="mt-2 h-px bg-[#E8E5E0]" />
    </div>
  );
}

function StyledSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative mt-1">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none w-full bg-transparent border-0 border-b border-[#D4CFC8] py-2.5 pr-8 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#9A7A5E] cursor-pointer transition-colors duration-200"
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[#9A7A5E]">
        <Chevron />
      </span>
    </div>
  );
}

function CheckItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="group flex items-center gap-3 py-1.5 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={`w-4 h-4 shrink-0 border transition-all duration-150 flex items-center justify-center
          ${checked
            ? "border-[#9A7A5E] bg-[#9A7A5E]"
            : "border-[#D4CFC8] group-hover:border-[#9A7A5E]"
          }`}
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span
        className={`text-sm transition-colors duration-150
          ${checked
            ? "text-[#1A1A1A] font-medium"
            : "text-[#6B6B6B] group-hover:text-[#1A1A1A]"
          }`}
      >
        {label}
      </span>
    </label>
  );
}

/* -------------------------------------------------------
   Main component
------------------------------------------------------- */

export default function FiltersSidebar({
  categorySlug,
  basePath,
}: {
  categorySlug: string;
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedBase = basePath ?? `/category/${categorySlug}`;

  const [tileSizes, setTileSizes] = useState<TileSize[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const sizeRes = await fetch("/api/public/tile-sizes");
        if (!sizeRes.ok) throw new Error(`Tile size request failed ${sizeRes.status}`);
        const sizeJson = await sizeRes.json();
        if (sizeJson.tile_sizes) setTileSizes(sizeJson.tile_sizes);
      } catch (err) {
        console.error("Failed loading filters", err);
      }
    }
    loadData();
  }, []);

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "") params.delete(key);
    else params.set(key, value);
    router.push(`${resolvedBase}?${params.toString()}`);
  }

  function toggleMulti(key: string, optionValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",") ?? [];
    const exists = current.includes(optionValue);
    const updated = exists
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];
    if (updated.length === 0) params.delete(key);
    else params.set(key, updated.join(","));
    router.push(`${resolvedBase}?${params.toString()}`);
  }

  const getSelected = (key: string) => searchParams.get(key)?.split(",") ?? [];
  const selectedColours = getSelected("color");
  const selectedApps = getSelected("application");
  const selectedRooms = getSelected("suitable_room");

  const hasActiveFilters = [...searchParams.entries()].some(
    ([key]) => !["grid", "sort", "show"].includes(key)
  );

  function clearAll() {
    const params = new URLSearchParams();
    const sort = searchParams.get("sort");
    const grid = searchParams.get("grid");
    if (sort) params.set("sort", sort);
    if (grid) params.set("grid", grid);
    const qs = params.toString();
    router.push(qs ? `${resolvedBase}?${qs}` : resolvedBase);
  }

  return (
    <aside className="space-y-7 text-[#1A1A1A]">

      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <p className="text-[11px] tracking-[0.3em] uppercase font-medium">Filters</p>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-[10px] tracking-widest uppercase text-[#9A7A5E] hover:text-[#7A5E44] transition-colors border-b border-[#9A7A5E]/50 leading-tight"
          >
            Clear All
          </button>
        )}
      </div>

      {/* MATERIAL */}
      <div>
        <SectionLabel label="Material" />
        <StyledSelect
          value={searchParams.get("material") ?? ""}
          onChange={(e) => updateFilter("material", e.target.value)}
        >
          <option value="">Any</option>
          <option value="Ceramic">Ceramic</option>
          <option value="Porcelain">Porcelain</option>
        </StyledSelect>
      </div>

      {/* COLOUR */}
      <div>
        <SectionLabel label="Colour" />
        <div className="space-y-0.5">
          {[
            "Beige", "Black", "Brown", "Dark Grey", "Grey", "Light Grey",
            "White", "Cream", "Green", "Blue", "Purple", "Multi Colour",
          ].map((c) => (
            <CheckItem
              key={c}
              label={c}
              checked={selectedColours.includes(c)}
              onChange={() => toggleMulti("color", c)}
            />
          ))}
        </div>
      </div>

      {/* APPLICATION */}
      <div>
        <SectionLabel label="Application" />
        <div className="space-y-0.5">
          {["Floor", "Wall", "Countertop"].map((app) => (
            <CheckItem
              key={app}
              label={app}
              checked={selectedApps.includes(app)}
              onChange={() => toggleMulti("application", app)}
            />
          ))}
        </div>
      </div>

      {/* SUITABLE ROOM */}
      <div>
        <SectionLabel label="Suitable Room" />
        <div className="space-y-0.5">
          {["Any", "Lounge", "Kitchen", "Bathroom", "Commercial"].map((room) => (
            <CheckItem
              key={room}
              label={room}
              checked={selectedRooms.includes(room)}
              onChange={() => toggleMulti("suitable_room", room)}
            />
          ))}
        </div>
      </div>

      {/* INDOOR / OUTDOOR */}
      <div>
        <SectionLabel label="Indoor / Outdoor" />
        <StyledSelect
          value={searchParams.get("indoor_outdoor") ?? ""}
          onChange={(e) => updateFilter("indoor_outdoor", e.target.value)}
        >
          <option value="">Any</option>
          <option value="Indoor">Indoor</option>
          <option value="Outdoor">Outdoor</option>
        </StyledSelect>
      </div>

      {/* TILE SIZE */}
      <div>
        <SectionLabel label="Tile Size" />
        <StyledSelect
          value={searchParams.get("size") ?? ""}
          onChange={(e) => updateFilter("size", e.target.value)}
        >
          <option value="">Any</option>
          {tileSizes.map((s) => (
            <option key={s.id} value={s.label}>
              {s.label}
            </option>
          ))}
        </StyledSelect>
      </div>

      {/* PRICE RANGE */}
      <div>
        <SectionLabel label="Price per m²" />
        <div className="flex items-end gap-3 mt-2">
          <div className="flex-1">
            <span className="text-[10px] text-[#9A7A5E] tracking-widest uppercase">Min</span>
            <div className="relative mt-1.5">
              <span className="absolute left-0 bottom-2.5 text-sm text-[#9A7A5E] pointer-events-none">£</span>
              <input
                type="number"
                className="w-full border-0 border-b border-[#D4CFC8] pl-4 pb-2 pt-1 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] transition-colors placeholder-[#C4C0BB]"
                placeholder="0"
                defaultValue={searchParams.get("minPrice") ?? ""}
                onBlur={(e) => updateFilter("minPrice", e.target.value)}
              />
            </div>
          </div>

          <div className="w-4 h-px bg-[#D4CFC8] mb-3 shrink-0" />

          <div className="flex-1">
            <span className="text-[10px] text-[#9A7A5E] tracking-widest uppercase">Max</span>
            <div className="relative mt-1.5">
              <span className="absolute left-0 bottom-2.5 text-sm text-[#9A7A5E] pointer-events-none">£</span>
              <input
                type="number"
                className="w-full border-0 border-b border-[#D4CFC8] pl-4 pb-2 pt-1 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] transition-colors placeholder-[#C4C0BB]"
                placeholder="Any"
                defaultValue={searchParams.get("maxPrice") ?? ""}
                onBlur={(e) => updateFilter("maxPrice", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
}
