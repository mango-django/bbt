"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Suggestion = {
  id: string;
  name: string;
  slug: string | null;
};

export default function InstallationSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function updateParam(nextValue: string) {
    const query = new URLSearchParams(params.toString());
    if (!nextValue.trim()) query.delete("q");
    else query.set("q", nextValue.trim());
    router.push(`/installation-products?${query.toString()}`);
  }

  useEffect(() => {
    const term = value.trim();
    if (!term) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/public/installation-products/search?q=${encodeURIComponent(term)}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const json = await res.json();
        setSuggestions(Array.isArray(json.products) ? json.products : []);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setSuggestions([]);
        }
      }
    }, 200);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full sm:w-64" ref={dropdownRef}>
      <div className="relative">
        <input
          type="search"
          placeholder="Search products..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              updateParam(value);
              setShowDropdown(false);
            }
          }}
          className="w-full border-0 border-b border-[#D4CFC8] pb-2 pt-1 pr-6 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] transition-colors placeholder-[#C4C0BB] text-[#1A1A1A]"
        />
        {/* Search icon */}
        <span className="absolute right-0 bottom-2.5 text-[#9A7A5E] pointer-events-none">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </span>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-[#E8E5E0] shadow-sm">
          {suggestions.map((product) => (
            <button
              key={product.id}
              className="w-full text-left px-4 py-3 text-sm text-[#1A1A1A] hover:bg-[#FAFAF8] border-b border-[#E8E5E0] last:border-0 transition-colors"
              onClick={() => {
                setValue(product.name);
                updateParam(product.name);
                setShowDropdown(false);
              }}
            >
              {product.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
