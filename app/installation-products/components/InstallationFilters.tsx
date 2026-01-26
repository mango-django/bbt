"use client";

import { useRouter, useSearchParams } from "next/navigation";

const productTypes = ["adhesive", "grout", "sealer", "trim", "tool"];
const colours = ["N/A", "White", "Black", "Grey", "Beige", "Silver", "Jasmine"];

export default function InstallationFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function updateParam(key: string, value: string) {
    const query = new URLSearchParams(params.toString());
    if (value === "") query.delete(key);
    else query.set(key, value);
    router.push(`/installation-products?${query.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Product Type */}
      <select
        className="border border-gray-200 px-3 py-2 rounded"
        value={params.get("type") || ""}
        onChange={(e) => updateParam("type", e.target.value)}
      >
        <option value="">All Types</option>
        {productTypes.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* Colour */}
      <select
        className="border border-gray-200 px-3 py-2 rounded"
        value={params.get("colour") || ""}
        onChange={(e) => updateParam("colour", e.target.value)}
      >
        <option value="">All Colours</option>
        {colours.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Price Sort */}
      <select
        className="border border-gray-200 px-3 py-2 rounded"
        value={params.get("sort") || "newest"}
        onChange={(e) => updateParam("sort", e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="low">Price: Low → High</option>
        <option value="high">Price: High → Low</option>
      </select>
    </div>
  );
}
