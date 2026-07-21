import { Suspense } from "react";
import AllTilesClient from "./AllTilesClient";

export const metadata = {
  title: { absolute: "All Tiles | Bellos Bespoke Tiles" },
  description: "Browse our full collection of premium porcelain, ceramic, mosaic and outdoor tiles.",
  alternates: { canonical: "/tiles" },
};

export default function TilesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto p-6 flex justify-center items-center h-64 text-gray-400">
        Loading tiles…
      </div>
    }>
      <AllTilesClient />
    </Suspense>
  );
}
