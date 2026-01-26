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
    <div className="relative w-full sm:w-72" ref={dropdownRef}>
      <input
        type="search"
        className="border border-gray-200 px-3 py-2 rounded w-full"
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
      />

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {suggestions.map((product) => (
            <button
              key={product.id}
              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b last:border-none"
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
