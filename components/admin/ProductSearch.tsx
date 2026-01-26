"use client";

import { useState, useRef, useEffect } from "react";

type ProductSearchProps = {
  products: any[];
  onSelect: (id: string) => void;
  onSearch: (term: string) => void;
};

export default function ProductSearch({ products, onSelect, onSearch }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedTerm = searchTerm.trim().toLowerCase();
  const filteredSuggestions = normalizedTerm
    ? products
        .filter(
          (p) =>
            p.title?.toLowerCase().includes(normalizedTerm) ||
            p.display_id?.toLowerCase().includes(normalizedTerm) ||
            p.supplier_id?.toLowerCase().includes(normalizedTerm)
        )
        .slice(0, 5)
    : [];

  return (
    <div className="relative mb-6" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          className="block w-full rounded-md border border-gray-200 py-3 pl-4 pr-10 text-sm outline-none focus:border-blue-500 shadow-sm"
          placeholder="Search products by name, display ID, or supplier ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
        <span className="absolute right-3 top-3 text-gray-400">🔍</span>
      </div>

      {/* DROPDOWN LIST */}
      {showDropdown && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {filteredSuggestions.map((product) => (
            <button
              key={product.id}
              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b last:border-none flex justify-between"
              onClick={() => {
                setSearchTerm(product.title || "");
                onSearch(product.title || "");
                setShowDropdown(false);
              }}
            >
              <span className="font-medium">{product.title}</span>
              <span className="text-gray-400 text-xs">
                {product.display_id || product.supplier_id || product.status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
