"use client";

import { useRouter, useSearchParams } from "next/navigation";

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

    if (!value || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`?${params.toString()}`);
  }

  const sort = searchParams.get("sort") ?? "default";
  const show = searchParams.get("show") ?? "12";
  const grid = searchParams.get("grid") ?? "3"; // default 3-col

  return (
    <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4">

      {/* ================= LEFT SIDE ================= */}
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-gray-900">{heading}</h2>
        <div className="text-gray-600 text-sm mt-1">
          Showing <strong>{count}</strong> product{count !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ================= RIGHT SIDE CONTROLS ================= */}
      <div className="flex flex-wrap items-center gap-6">

        {/* --------- SORT BY --------- */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort:</span>
          <select
            className="border p-2"
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
          >
            <option value="default">Default</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* --------- SHOW PER PAGE --------- */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <select
            className="border p-2"
            value={show}
            onChange={(e) => updateParam("show", e.target.value)}
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="36">36</option>
            <option value="48">48</option>
          </select>
        </div>

        {/* --------- GRID VIEW TOGGLES --------- */}
        <div className="flex items-center gap-2">
          <button
            className={`p-2 border ${grid === "2" ? "bg-gray-200" : ""}`}
            onClick={() => updateParam("grid", "2")}
            title="2 column view"
            aria-label="2 column view"
          >
            <svg
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 24 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="0" y="0" width="10" height="6" />
              <rect x="14" y="0" width="10" height="6" />
              <rect x="0" y="10" width="10" height="6" />
              <rect x="14" y="10" width="10" height="6" />
            </svg>
          </button>

          <button
            className={`p-2 border ${grid === "3" ? "bg-gray-200" : ""}`}
            onClick={() => updateParam("grid", "3")}
            title="3 column view"
            aria-label="3 column view"
          >
            <svg
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 24 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="0" y="0" width="6" height="6" />
              <rect x="9" y="0" width="6" height="6" />
              <rect x="18" y="0" width="6" height="6" />
              <rect x="0" y="10" width="6" height="6" />
              <rect x="9" y="10" width="6" height="6" />
              <rect x="18" y="10" width="6" height="6" />
            </svg>
          </button>

          <button
            className={`p-2 border ${grid === "4" ? "bg-gray-200" : ""}`}
            onClick={() => updateParam("grid", "4")}
            title="4 column view"
            aria-label="4 column view"
          >
            <svg
              className="w-4 h-4 text-gray-400"
              viewBox="0 0 24 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="1" y="0" width="4" height="6" />
              <rect x="7" y="0" width="4" height="6" />
              <rect x="13" y="0" width="4" height="6" />
              <rect x="19" y="0" width="4" height="6" />
              <rect x="1" y="10" width="4" height="6" />
              <rect x="7" y="10" width="4" height="6" />
              <rect x="13" y="10" width="4" height="6" />
              <rect x="19" y="10" width="4" height="6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
