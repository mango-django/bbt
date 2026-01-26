"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import ProductGallery from "@/components/ProductGallery";
import ProductCalculator from "@/components/ProductCalculator";

export default function ProductPageClient({ product, sortedImages }: any) {
  const { addItem } = useCart();

  const num = (value: any) => {
    if (value === null || value === undefined) return null;
    const raw = String(value).trim();
    if (!raw || raw.toLowerCase() === "null") return null;
    const parsed = Number(raw.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  };

  /* ----------------------------------------------
     NORMALISED BOX DATA
     ---------------------------------------------- */

  const weightPerBox =
    num(product.weight_per_box) ??
    num(product.box_weight_kg) ??
    0;

  const coveragePerBox =
    Number(product.box_coverage_m2) ||
    Number(product.m2_per_box) ||
    0.01; // prevent division issues

  /* ----------------------------------------------
     DERIVED PRICING (fallback when DB is null)
     ---------------------------------------------- */
  const widthMm = num(product.tile_width_mm);
  const heightMm = num(product.tile_height_mm);
  const pricePerM2 = num(product.price_per_m2);
  const tilesPerBox = num(product.tiles_per_box);

  const areaM2 =
    widthMm !== null && heightMm !== null
      ? (widthMm * heightMm) / 1_000_000
      : null;

  const derivedPricePerTile =
    pricePerM2 !== null && areaM2 && areaM2 > 0
      ? Number((pricePerM2 * areaM2).toFixed(2))
      : null;

  const derivedPricePerBox =
    derivedPricePerTile !== null && tilesPerBox && tilesPerBox > 0
      ? Number((derivedPricePerTile * tilesPerBox).toFixed(2))
      : null;

  const pricePerTile =
    num(product.price_per_tile) ?? derivedPricePerTile;
  const pricePerBox =
    num(product.price_per_box) ?? derivedPricePerBox;

  const productWithDerivedPrices = {
    ...product,
    price_per_tile: pricePerTile ?? product.price_per_tile,
    price_per_box: pricePerBox ?? product.price_per_box,
  };

  /* ----------------------------------------------
     FINISH OPTIONS
     ---------------------------------------------- */
  const finishList = Array.isArray(product.finish)
    ? product.finish
    : product.finish
    ? [product.finish]
    : [];

  const [selectedFinish, setSelectedFinish] = useState(
    finishList.length === 1 ? finishList[0] : ""
  );

  /* ----------------------------------------------
     CALCULATOR OUTPUT
     ---------------------------------------------- */
  const [calculatedM2, setCalculatedM2] = useState(1);
  const [calculatedBoxes, setCalculatedBoxes] = useState(1);
  const [calculatedTiles, setCalculatedTiles] = useState(0);

  /* ----------------------------------------------
     PRODUCT IMAGE
     ---------------------------------------------- */
  const firstImage = sortedImages?.[0]?.url ?? "";

  /* ----------------------------------------------
     ADD TO CART
     ---------------------------------------------- */
  const handleAddToBasket = () => {
  if (finishList.length > 0 && !selectedFinish) {
    alert("Please select a finish before adding to basket.");
    return;
  }

  addItem({
    product_id: product.id,
    title: product.title,
    image: firstImage,
    finish: selectedFinish,

    /* ----------------------------------------
       REQUIRED BY NEW CART FORMAT (TILE)
       ---------------------------------------- */
    productType: "tile",
    price_per_m2: Number(product.price_per_m2),

    m2: calculatedM2,       // includes wastage
    coverage: coveragePerBox,
    boxWeight: weightPerBox,

    /* ----------------------------------------
       ALL PRODUCTS HAVE QUANTITY
       ---------------------------------------- */
    quantity: 1,
  });

  alert("Added to basket!");
};


  /* ----------------------------------------------
     RENDER VIEW
     ---------------------------------------------- */
  return (
    <div className="bg-white text-[#1f1f1f]">
      <div className="max-w-6xl mx-auto p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* IMAGE GALLERY */}
          <ProductGallery images={sortedImages} title={product.title} />

          {/* RIGHT SECTION */}
          <div>
            <h1 className="text-3xl font-bold mb-3">{product.title}</h1>

            <p className="text-gray-700 text-lg mb-3">
              {product.tile_width_mm} × {product.tile_height_mm} mm
            </p>

            <p className="text-gray-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* FINISH SELECTOR */}
            {finishList.length > 0 && (
              <div className="mb-6">
                <label className="font-semibold block mb-2">Finish</label>
                <select
                  className="border p-3 w-full rounded"
                  value={selectedFinish}
                  onChange={(e) => setSelectedFinish(e.target.value)}
                >
                  <option value="">Select finish</option>
                  {finishList.map((f: string) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            )}

            {/* PRICE DISPLAY */}
            <div className="text-2xl font-semibold mb-6">
              £{product.price_per_m2} / m²
            </div>

            {/* CALCULATOR */}
            <ProductCalculator
              product={productWithDerivedPrices}
              onChange={(calc) => {
                setCalculatedM2(calc.m2);
                setCalculatedBoxes(calc.boxes);
                setCalculatedTiles(calc.tiles);
              }}
            />

            {/* ADD TO CART BUTTON */}
            <button
              className="mt-6 w-full py-3 bg-blue-600 text-white rounded-none"
              onClick={handleAddToBasket}
            >
              Add to Basket
            </button>

            {/* SPECIFICATIONS TABLE */}
            <div className="mt-10 border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <TableRow
                    label="Price per Tile"
                    value={
                      pricePerTile !== null ? `£${pricePerTile}` : "—"
                    }
                  />
                  <TableRow
                    label="Price per Box"
                    value={
                      pricePerBox !== null ? `£${pricePerBox}` : "—"
                    }
                  />
                  <TableRow label="m² per Box" value={`${coveragePerBox} m²`} />
                  <TableRow label="Tiles per Box" value={product.tiles_per_box} />
                  <TableRow label="Tile Thickness" value={`${product.tile_thickness_mm} mm`} />
                  <TableRow label="Material" value={product.material || "—"} />
                  <TableRow
                    label="Colour"
                    value={
                      Array.isArray(product.color)
                        ? product.color.join(", ")
                        : product.color || "—"
                    }
                  />
                  <TableRow
                    label="Finish"
                    value={selectedFinish || finishList.join(", ") || "—"}
                  />
                  <TableRow
                    label="Applications"
                    value={
                      Array.isArray(product.application)
                        ? product.application.join(", ")
                        : product.application || "—"}
                  />
                  <TableRow
                    label="Suitable Rooms"
                    value={
                      Array.isArray(product.suitable_room)
                        ? product.suitable_room.join(", ")
                        : product.suitable_room || "—"}
                  />
                  <TableRow
                    label="Indoor / Outdoor"
                    value={product.indoor_outdoor || "—"}
                  />
                  <TableRow label="Weight per Box" value={`${weightPerBox} kg`} />
                  <TableRow label="Boxes in Stock" value={product.boxes_in_stock} />
                  <TableRow label="Lead Time" value={`${product.lead_time_days} days`} />
                </tbody>
              </table>
            </div>

            <button className="mt-6 w-full py-3 bg-black text-white rounded-none">
              View In 3D Visualiser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableRow({ label, value }: { label: string; value: any }) {
  return (
    <tr className="border-b">
      <td className="p-3 font-medium text-gray-700">{label}</td>
      <td className="p-3 text-gray-900">{value}</td>
    </tr>
  );
}
