"use client";

import { useRouter, useSearchParams } from "next/navigation";

/* -------------------------------------------------------
   Shared: styled underline select with custom chevron
------------------------------------------------------- */
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
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

/* -------------------------------------------------------
   Grid toggle icons
------------------------------------------------------- */
function GridIcon({ cols }: { cols: "2" | "3" | "4" }) {
  if (cols === "2") return (
    <svg className="w-4 h-4" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="0" y="0" width="10" height="6" /><rect x="14" y="0" width="10" height="6" />
      <rect x="0" y="10" width="10" height="6" /><rect x="14" y="10" width="10" height="6" />
    </svg>
  );
  if (cols === "4") return (
    <svg className="w-4 h-4" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="1" y="0" width="4" height="6" /><rect x="7" y="0" width="4" height="6" /><rect x="13" y="0" width="4" height="6" /><rect x="19" y="0" width="4" height="6" />
      <rect x="1" y="10" width="4" height="6" /><rect x="7" y="10" width="4" height="6" /><rect x="13" y="10" width="4" height="6" /><rect x="19" y="10" width="4" height="6" />
    </svg>
  );
  // default: 3
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="0" y="0" width="6" height="6" /><rect x="9" y="0" width="6" height="6" /><rect x="18" y="0" width="6" height="6" />
      <rect x="0" y="10" width="6" height="6" /><rect x="9" y="10" width="6" height="6" /><rect x="18" y="10" width="6" height="6" />
    </svg>
  );
}

/* -------------------------------------------------------
   Top bar
------------------------------------------------------- */
export default function CategoryTopBar({
  count,
  heading,
}: {
  count: number;
  heading: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "") params.delete(key);
    else params.set(key, value);
    router.push(`?${params.toString()}`);
  }

  const sort = searchParams.get("sort") ?? "default";
  const show = searchParams.get("show") ?? "12";
  const grid = searchParams.get("grid") ?? "3";

  return (
    <div className="flex flex-wrap justify-between items-end gap-4 pb-5 border-b border-[#E8E5E0]">

      {/* Left — heading + count */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-light tracking-wider text-[#1A1A1A] capitalize">
          {heading}
        </h2>
        <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mt-1.5">
          {count} product{count !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Right — controls */}
      <div className="flex flex-wrap items-center gap-5">

        {/* Sort */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] shrink-0">Sort</span>
          <StyledSelect value={sort} onChange={(e) => updateParam("sort", e.target.value)}>
            <option value="default">Default</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="newest">Newest</option>
          </StyledSelect>
        </div>

        {/* Show per page */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] shrink-0">Show</span>
          <StyledSelect value={show} onChange={(e) => updateParam("show", e.target.value)}>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="36">36</option>
            <option value="48">48</option>
          </StyledSelect>
        </div>

        {/* Grid toggles */}
        <div className="flex items-center gap-1">
          {(["2", "3", "4"] as const).map((g) => (
            <button
              key={g}
              onClick={() => updateParam("grid", g)}
              title={`${g} columns`}
              aria-label={`${g} column view`}
              className={`w-8 h-8 flex items-center justify-center border transition-all duration-200
                ${grid === g
                  ? "border-[#9A7A5E] bg-[#9A7A5E] text-white"
                  : "border-[#E8E5E0] text-[#A0A0A0] hover:border-[#9A7A5E] hover:text-[#9A7A5E]"
                }`}
            >
              <GridIcon cols={g} />
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
