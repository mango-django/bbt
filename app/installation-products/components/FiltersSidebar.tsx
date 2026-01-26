"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function FiltersSidebar() {
  const router = useRouter();
  const params = useSearchParams();

  function updateFilter(key: string, value: string) {
    const newParams = new URLSearchParams(params.toString());

    if (!value) newParams.delete(key);
    else newParams.set(key, value);

    router.push(`/installation-products?${newParams.toString()}`);
  }

  const selectedType = params.get("type") || "";
  const selectedColour = params.get("colour") || "";
  const selectedUnit = params.get("unit_type") || "";
  const selectedAmount = params.get("unit_amount") || "";

  return (
    <div className="space-y-6 border p-4 rounded bg-white shadow-sm">

      {/* PRODUCT TYPE */}
      <div>
        <label className="font-semibold block">Product Type</label>
        <select
          value={selectedType}
          onChange={(e) => updateFilter("type", e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Any</option>
          <option value="adhesive">Adhesive</option>
          <option value="grout">Grout</option>
          <option value="sealer">Sealer</option>
          <option value="trim">Trim</option>
          <option value="tool">Tool</option>
        </select>
      </div>

      {/* COLOUR — only relevant for grout */}
      <div>
        <label className="font-semibold block">Colour (for grout)</label>
        <select
          value={selectedColour}
          onChange={(e) => updateFilter("colour", e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Any</option>
          <option value="white">White</option>
          <option value="grey">Grey</option>
          <option value="beige">Beige</option>
          <option value="black">Black</option>
        </select>
      </div>

      {/* UNIT TYPE (kg or litre) */}
      <div>
        <label className="font-semibold block">Unit Type</label>
        <select
          value={selectedUnit}
          onChange={(e) => updateFilter("unit_type", e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Any</option>
          <option value="kg">Kilograms (kg)</option>
          <option value="litre">Litres (L)</option>
        </select>
      </div>

      {/* UNIT AMOUNT */}
      <div>
        <label className="font-semibold block">Amount</label>
        <select
          value={selectedAmount}
          onChange={(e) => updateFilter("unit_amount", e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Any</option>
          <option value="2">2</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="1">1 (L)</option>
        </select>
      </div>
    </div>
  );
}
