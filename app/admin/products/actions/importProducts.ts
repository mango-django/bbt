"use server";

import Papa from "papaparse";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createProductSlug } from "@/lib/utils/slug";

export async function importProductsFromCSV(file: File) {
  const supabase = await supabaseAdmin(); // ✅ FIX

  const csvText = await file.text();

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length) {
    console.error(parsed.errors);
    throw new Error("CSV parsing failed");
  }

  const cleanedRows = parsed.data.map((row: any) => {
    const {
      uid,
      slug,
      created_at,
      updated_at,
      ...rest
    } = row;

    if (!row.title || !row.dimension_string) {
      throw new Error("Missing title or dimension_string");
    }

    return {
      ...rest,
      slug: createProductSlug(
        row.title,
        row.dimension_string
      ),
    };
  });

  const { error } = await supabase
    .from("products") // or installation_products
    .insert(cleanedRows);

  if (error) {
    console.error("SUPABASE INSERT ERROR:", error);
    throw error;
  }

  return {
    success: true,
    count: cleanedRows.length,
  };
}
