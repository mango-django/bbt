
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ room: string }> }
) {
  const { room: roomSlug } = await context.params;

  if (!roomSlug) {
    return NextResponse.json(
      { error: "Missing room parameter" },
      { status: 400 }
    );
  }

  const supabase = supabaseAdmin();

  /* -----------------------------
     1. Fetch room model
  ----------------------------- */
  const { data: room, error: roomError } = await supabase
    .from("room_models")
    .select("*")
    .eq("slug", roomSlug)
    .eq("enabled", true)
    .single();

  if (roomError || !room) {
    return NextResponse.json(
      { error: "Room not found" },
      { status: 404 }
    );
  }

  /* -----------------------------
     2. Fetch textures for room
  ----------------------------- */
  const { data: textures, error: textureError } = await supabase
    .from("visualiser_textures")
    .select(`
      id,
      product_id,
      category,
      display_name,
      texture_url,
      thumbnail_url,
      roughness,
      metalness,
      env_map_intensity,
      scale_x,
      scale_y,
      default_selected
    `)
    .eq("room_slug", roomSlug)
    .eq("enabled_in_3d", true)
    .order("sort_order", { ascending: true });

  if (textureError) {
    return NextResponse.json(
      { error: "Failed to load textures" },
      { status: 500 }
    );
  }

  /* -----------------------------
     3. Group by category
  ----------------------------- */
  const categories: Record<string, any[]> = {};

  textures.forEach((tex) => {
    if (!categories[tex.category]) {
      categories[tex.category] = [];
    }
    categories[tex.category].push(tex);
  });

  /* -----------------------------
     4. Response
  ----------------------------- */
  return NextResponse.json({
    room: {
      name: room.name,
      slug: room.slug,
      glb_url: room.glb_url,
      camera: room.default_camera,
      allowed_categories: room.allowed_categories,
    },
    categories,
  });
}
