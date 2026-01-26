"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function FiltersSidebar({ categorySlug }: { categorySlug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tileSizes, setTileSizes] = useState<any[]>([]);

  /* ---------------------------------------
     LOAD RANGES + TILE SIZES
  ---------------------------------------- */
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


  /* ---------------------------------------
     DIRECT FILTER UPDATE (single select)
  ---------------------------------------- */
  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "") params.delete(key);
    else params.set(key, value);

    router.push(`/category/${categorySlug}?${params.toString()}`);
  }

  /* ---------------------------------------
     MULTI SELECT (checkboxes)
  ---------------------------------------- */
  function toggleMulti(key: string, optionValue: string) {
    const params = new URLSearchParams(searchParams.toString());

    const current = params.get(key)?.split(",") ?? [];
    const exists = current.includes(optionValue);

    const updated = exists
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];

    if (updated.length === 0) params.delete(key);
    else params.set(key, updated.join(","));

    router.push(`/category/${categorySlug}?${params.toString()}`);
  }

  /* ---------------------------------------
     Helpers for checkbox state
  ---------------------------------------- */
  const getSelected = (key: string) =>
    searchParams.get(key)?.split(",") ?? [];

  const selectedColours = getSelected("color");
  const selectedApps = getSelected("application");
  const selectedRooms = getSelected("suitable_room");

  return (
    <aside className="space-y-8 border p-6 bg-white shadow-sm text-[#4a4a4a]">

      {/* MATERIAL */}
      <div>
        <h3 className="font-semibold mb-3">Material</h3>
        <select
          className="border p-2 w-full"
          value={searchParams.get("material") ?? ""}
          onChange={(e) => updateFilter("material", e.target.value)}
        >
          <option value="">Any</option>
          <option value="Ceramic">Ceramic</option>
          <option value="Porcelain">Porcelain</option>
        </select>
      </div>

      {/* COLOUR */}
      <div>
        <h3 className="font-semibold mb-3">Colour</h3>

        {[
          "Beige", "Black", "Brown", "Dark Grey", "Grey", "Light Grey",
          "White", "Cream", "Green", "Blue", "Purple", "Multi Colour"
        ].map((c) => (
          <label key={c} className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={selectedColours.includes(c)}
              onChange={() => toggleMulti("color", c)}
            />
            {c}
          </label>
        ))}
      </div>

      {/* APPLICATION */}
      <div>
        <h3 className="font-semibold mb-3">Application</h3>
        {["Floor", "Wall", "Countertop"].map((app) => (
          <label key={app} className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={selectedApps.includes(app)}
              onChange={() => toggleMulti("application", app)}
            />
            {app}
          </label>
        ))}
      </div>

      {/* SUITABLE ROOM */}
      <div>
        <h3 className="font-semibold mb-3">Suitable Room</h3>
        {["Any", "Lounge", "Kitchen", "Bathroom", "Commercial"].map((room) => (
          <label key={room} className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={selectedRooms.includes(room)}
              onChange={() => toggleMulti("suitable_room", room)}
            />
            {room}
          </label>
        ))}
      </div>

      {/* INDOOR / OUTDOOR */}
      <div>
        <h3 className="font-semibold mb-3">Indoor / Outdoor</h3>
        <select
          className="border p-2 w-full"
          value={searchParams.get("indoor_outdoor") ?? ""}
          onChange={(e) => updateFilter("indoor_outdoor", e.target.value)}
        >
          <option value="">Any</option>
          <option value="Indoor">Indoor</option>
          <option value="Outdoor">Outdoor</option>
        </select>
      </div>

      {/* TILE SIZE */}
      <div>
        <h3 className="font-semibold mb-3">Tile Size</h3>
        <select
          className="border p-2 w-full"
          value={searchParams.get("size") ?? ""}
          onChange={(e) => updateFilter("size", e.target.value)}
        >
          <option value="">Any</option>
          {tileSizes.map((s) => (
            <option key={s.id} value={s.label}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* PRICE RANGE */}
      <div>
        <h3 className="font-semibold mb-3">Price per m²</h3>

        <input
          type="number"
          className="border p-2 w-full mb-2"
          placeholder="Min (£)"
          defaultValue={searchParams.get("minPrice") ?? ""}
          onBlur={(e) => updateFilter("minPrice", e.target.value)}
        />
        <input
          type="number"
          className="border p-2 w-full"
          placeholder="Max (£)"
          defaultValue={searchParams.get("maxPrice") ?? ""}
          onBlur={(e) => updateFilter("maxPrice", e.target.value)}
        />
      </div>

    </aside>
  );
}
