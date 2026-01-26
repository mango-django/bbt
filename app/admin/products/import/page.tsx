"use client";

import { useState } from "react";
import { importProductsFromCSV } from "../actions/importProducts";

export default function ImportProductsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setMessage("");

    try {
      const result = await importProductsFromCSV(file);
      setMessage(`✅ Imported ${result.count} products`);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4 max-w-lg">
      <h1 className="text-xl font-bold">Import Products via CSV</h1>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Uploading..." : "Upload CSV"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
