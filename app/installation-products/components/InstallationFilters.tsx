"use client";

import { useRouter, useSearchParams } from "next/navigation";

const fallbackProductTypes = ["adhesive", "grout", "sealer", "trim", "tool", "heating", "matting"];
const fallbackColours = ["White", "Black", "Grey", "Beige", "Silver", "Jasmine", "N/A"];

function typeLabel(type: string) {
  const label = type.replace(/-/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function Chevron() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
      <path
        d="M1 1L5 5L9 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none bg-transparent border-0 border-b border-[#D4CFC8] py-1.5 pr-7 pl-0 text-xs tracking-wide text-[#1A1A1A] focus:outline-none focus:border-[#9A7A5E] cursor-pointer transition-colors duration-200"
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#9A7A5E]">
        <Chevron />
      </span>
    </div>
  );
}

export default function InstallationFilters({
  productTypes,
  colours,
}: {
  productTypes?: string[];
  colours?: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const types = productTypes?.length ? productTypes : fallbackProductTypes;
  const colourOptions = colours?.length ? colours : fallbackColours;

  function updateParam(key: string, value: string) {
    const query = new URLSearchParams(params.toString());
    if (value === "") query.delete(key);
    else query.set(key, value);
    router.push(`/installation-products?${query.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-5">

      {/* Type label */}
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] shrink-0">Type</span>
        <StyledSelect
          value={params.get("type") || ""}
          onChange={(e) => updateParam("type", e.target.value)}
        >
          <option value="">All</option>
          {types.map((t) => (
            <option key={t} value={t}>{typeLabel(t)}</option>
          ))}
        </StyledSelect>
      </div>

      {/* Colour */}
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] shrink-0">Colour</span>
        <StyledSelect
          value={params.get("colour") || ""}
          onChange={(e) => updateParam("colour", e.target.value)}
        >
          <option value="">All</option>
          {colourOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </StyledSelect>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] shrink-0">Sort</span>
        <StyledSelect
          value={params.get("sort") || "newest"}
          onChange={(e) => updateParam("sort", e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
        </StyledSelect>
      </div>

    </div>
  );
}
