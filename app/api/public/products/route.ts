import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const DEFAULT_PAGE_SIZE = 24;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(
    48,
    Math.max(1, Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE))
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const admin = supabaseAdmin();

  let query = admin
    .from("products")
    .select(
      `
      id,
      title,
      slug,
      dimension_string,
      price_per_m2,
      price_per_box,
      material,
      finish,
      product_images (
        id,
        url:image_url,
        sort_order
      )
    `,
      { count: "exact" }
    )
    .eq("status", "active");

  /* ---- Filters ---- */
  const material = searchParams.get("material");
  if (material) query = query.eq("material", material);

  const color = searchParams.get("color");
  if (color) {
    const colors = color.split(",");
    query = query.or(colors.map((c) => `color.cs.{${c}}`).join(","));
  }

  const finish = searchParams.get("finish");
  if (finish) query = query.eq("finish", finish);

  const application = searchParams.get("application");
  if (application) {
    const apps = application.split(",");
    query = query.or(apps.map((a) => `application.cs.{${a}}`).join(","));
  }

  const suitableRoom = searchParams.get("suitable_room");
  if (suitableRoom) {
    const rooms = suitableRoom.split(",");
    query = query.or(rooms.map((r) => `suitable_room.cs.{${r}}`).join(","));
  }

  const indoorOutdoor = searchParams.get("indoor_outdoor");
  if (indoorOutdoor) query = query.eq("indoor_outdoor", indoorOutdoor);

  const size = searchParams.get("size");
  if (size) query = query.eq("dimension_string", size);

  const minPrice = Number(searchParams.get("minPrice") ?? 0);
  const maxPrice = Number(searchParams.get("maxPrice") ?? 99999);
  query = query.gte("price_per_m2", minPrice).lte("price_per_m2", maxPrice);

  /* ---- Sort ---- */
  const sort = searchParams.get("sort") ?? "default";
  if (sort === "price_asc")
    query = query.order("price_per_m2", { ascending: true });
  else if (sort === "price_desc")
    query = query.order("price_per_m2", { ascending: false });
  else
    query = query.order("created_at", { ascending: false });

  query = query.order("sort_order", {
    foreignTable: "product_images",
    ascending: true,
  });

  /* ---- Pagination ---- */
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("GET /api/public/products error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;
  const loaded = from + (data?.length ?? 0);

  return NextResponse.json({
    products: data ?? [],
    total,
    page,
    pageSize,
    hasMore: loaded < total,
  });
}
