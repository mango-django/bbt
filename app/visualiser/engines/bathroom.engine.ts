"use client";

/* =====================================================
   STATE
===================================================== */

let BATHROOM_INITIALISED = false;


type ApplyMode = "set" | "walls" | "floor";

let applyMode: ApplyMode = "set";
let activeTileId: string | null = null;
let activeTileIndex: number = -1;


/* =====================================================
   TILE DATA (TEMP – later move to API / JSON)
===================================================== */

type TileProduct = {
  id: string;
  name: string;
  brand: string;

  colour: string[];
  finishes: string[];
  sizes: string[];

  material: string;
  suitability: string;
  sku: string;

  wallImage: string;
  floorImage: string;

  thumbnail: string;
  productUrl: string;
};

const TILES: TileProduct[] = [
  {
    id: "amani-marble-dark-grey",
    name: "Amani Marble Dark Grey",
    brand: "RAK",
    colour: ["Dark Grey", "Grey"],
    finishes: ["Polished"],
    sizes: ["600x600", "600x1200"],
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "AMDG-001",
    wallImage: "/visualiser/bathroom/walls/wl_amani_marble_dark_grey.webp",
    floorImage: "/visualiser/bathroom/floors/fl_amani_marble_dark_grey.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/amani_marble_dark_grey.webp",
    productUrl: "/products/amani-marble-dark-grey-1200x1200",
  },
  {
    id: "amani-marble-light-grey",
    name: "Amani Marble Light Grey",
    brand: "RAK",
    colour: ["Light Grey", "Grey"],
    finishes: ["Polished"],
    sizes: ["600x600", "600x1200"],
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "AMLG-001",
    wallImage: "/visualiser/bathroom/walls/wl_amani_marble_light_grey.webp",
    floorImage: "/visualiser/bathroom/floors/fl_amani_marble_light_grey.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/amani_marble_light_grey.webp",
    productUrl: "/products/amani-marble-light-grey-1200x1200",
  },
  {
    id: "breccia-adige",
    name: "Breccia Adige",
    brand: "RAK",
    colour: ["Beige", "Natural"],
    finishes: ["Polished", "Matt"],
    sizes: ["600x600", "600x1200"],
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "BA-002",
    wallImage: "/visualiser/bathroom/walls/wl_breccia_adige.webp",
    floorImage: "/visualiser/bathroom/floors/fl_breccia_adige.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/breccia_adige.webp",
    productUrl: "/products/breccia-adige-grey-1200x1200",
  },
  {
    id: "calacatta-africa-white",
    name: "Calacatta Africa White",
    brand: "RAK",
    colour: ["White"],
    finishes: ["Polished"],
    sizes: ["600x1200", "1200x1200"],
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "CAW-003",
    wallImage: "/visualiser/bathroom/walls/wl_calacatta_africa_white.webp",
    floorImage: "/visualiser/bathroom/floors/fl_calacatta_africa_white.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/calacatta_africa_white.webp",
    productUrl: "/products/calacatta-africa-white-1200x1200",
  },
  {
    id: "calacatta-gold-white",
    name: "Calacatta Gold White",
    brand: "RAK",
    colour: ["White", "Gold"],
    finishes: ["Polished"],
    sizes: ["600x1200", "1200x1200"],
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "CGW-004",
    wallImage: "/visualiser/bathroom/walls/wl_calacatta_gold_white.webp",
    floorImage: "/visualiser/bathroom/floors/fl_calacatta_gold_white.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/calacatta_gold_white.webp",
    productUrl: "/products/calacatta-gold-white-1200x1200",
  },
  {
    id: "carmo-stone-black",
    name: "Carmo Stone Black",
    brand: "RAK",
    colour: ["Black"],
    finishes: ["Matt"],
    sizes: ["600x600", "600x1200"],
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "CSB-005",
    wallImage: "/visualiser/bathroom/walls/wl_carmo_stone_black.webp",
    floorImage: "/visualiser/bathroom/floors/fl_carmo_stone_black.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/carmo_stone_black.webp",
    productUrl: "/products/carmo-stone-black-600x1200",
  },
  {
    id: "carmo-stone-grey",
    name: "Carmo Stone Grey",
    brand: "RAK",
    colour: ["Grey"],
    finishes: ["Matt"],
    sizes: ["600x600", "600x1200"],
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "CSG-006",
    wallImage: "/visualiser/bathroom/walls/wl_carmo_stone_grey.webp",
    floorImage: "/visualiser/bathroom/floors/fl_carmo_stone_grey.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/carmo_stone_grey.webp",
    productUrl: "/products/carmo-stone-grey-600x1200",
  },
  {
    id: "carmo-stone-ivory",
    name: "Carmo Stone Ivory",
    brand: "RAK",
    colour: ["Ivory", "Cream"],
    finishes: ["Matt"],
    sizes: ["600x600", "600x1200"],
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "CSI-007",
    wallImage: "/visualiser/bathroom/walls/wl_carmo_stone_ivory.webp",
    floorImage: "/visualiser/bathroom/floors/fl_carmo_stone_ivory.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/carmo_stone_ivory.webp",
    productUrl: "/products/carmo-stone-ivory-600x1200",
  },
  {
    id: "carmo-stone-anthracite",
    name: "Carmo Stone Anthracite",
    brand: "RAK",
    colour: ["Anthracite", "Dark Grey"],
    finishes: ["Matt"],
    sizes: ["600x600", "600x1200"],
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "CSA-008",
    wallImage: "/visualiser/bathroom/walls/wl_carmo-stone-anthracite.webp",
    floorImage: "/visualiser/bathroom/floors/fl_carmo-stone-anthracite.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/carmo_stone_anthracite.webp",
    productUrl: "/products/carmo-stone-anthracite-600x1200",
  },
  {
    id: "classic-carrera",
    name: "Classic Carrera",
    brand: "RAK",
    colour: ["White"],
    finishes: ["Polished"],
    sizes: ["600x600", "600x1200"],
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "CC-009",
    wallImage: "/visualiser/bathroom/walls/wl_classic_carrera.webp",
    floorImage: "/visualiser/bathroom/floors/fl_classic_carrera.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/classic_carrera.webp",
    productUrl: "/products/classic-carrera-1200x1200",
  },
  {
    id: "surface-2-0-ash",
    name: "Surface 2.0 Ash",
    brand: "RAK",
    colour: ["Ash", "Grey"],
    finishes: ["Matt"],
    sizes: ["600x600"],
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "S2A-010",
    wallImage: "/visualiser/bathroom/walls/wl_surface_2.0_ash.webp",
    floorImage: "/visualiser/bathroom/floors/fl_surface_2.0_ash.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/surface_2_0_ash.webp",
    productUrl: "/products/surface-2-0-ash-600x1200",
  },
  {
    id: "surface-2-0-cool-grey",
    name: "Surface 2.0 Cool Grey",
    brand: "RAK",
    colour: ["Cool Grey"],
    finishes: ["Matt"],
    sizes: ["600x600"],
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "S2CG-011",
    wallImage: "/visualiser/bathroom/walls/wl_surface_2.0_cool_grey.webp",
    floorImage: "/visualiser/bathroom/floors/fl_surface_2.0_cool_grey.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/surface_2_0_cool_grey.webp",
    productUrl: "/products/surface-2-0-cool-grey-1200x1200",
  },
  {
    id: "surface-2-0-mid-grey",
    name: "Surface 2.0 Mid Grey",
    brand: "RAK",
    colour: ["Mid Grey"],
    finishes: ["Matt"],
    sizes: ["600x600"],
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "S2MG-012",
    wallImage: "/visualiser/bathroom/walls/wl_surface_2.0_mid_grey.webp",
    floorImage: "/visualiser/bathroom/floors/fl_surface_2.0_mid_grey.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/surface_2_0_mid_grey.webp",
    productUrl: "/products/surface-2-0-mid-grey-1200x1200",
  },
  {
    id: "surface-2-0-off-white",
    name: "Surface 2.0 Off White",
    brand: "RAK",
    colour: ["Off White"],
    finishes: ["Matt"],
    sizes: ["600x600"],
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "S2OW-013",
    wallImage: "/visualiser/bathroom/walls/wl_surface_2.0_off_white.webp",
    floorImage: "/visualiser/bathroom/floors/fl_surface_2.0_off_white.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/surface_2_0_off_white.webp",
    productUrl: "/products/surface-2-0-off-white-1200x1200",
  },

/* =====================================================
   VERONA
===================================================== */

{
  id: "alpaca-white",
  name: "Alpaca White",
  brand: "Bellos",
  colour: ["White"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-ALP-WHT",
  wallImage: "/visualiser/bathroom/walls/wl_alpaca_white.webp",
  floorImage: "/visualiser/bathroom/floors/fl_alpaca_white.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/alpaca_white.webp",
  productUrl: "/products/alpaca-white",
},
{
  id: "amy-terrazzo-beige",
  name: "Amy Terrazzo Beige",
  brand: "Bellos",
  colour: ["Beige"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-AMY-BEI",
  wallImage: "/visualiser/bathroom/walls/wl_amy_terrazzo_beige.webp",
  floorImage: "/visualiser/bathroom/floors/fl_amy_terrazzo_beige.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/amy_terrazzo_beige.webp",
  productUrl: "/products/amy-terrazzo-beige",
},
{
  id: "amy-terrazzo-grey",
  name: "Amy Terrazzo Grey",
  brand: "Bellos",
  colour: ["Grey"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-AMY-GRY",
  wallImage: "/visualiser/bathroom/walls/wl_amy_terrazzo_grey.webp",
  floorImage: "/visualiser/bathroom/floors/fl_amy_terrazzo_grey.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/amy_terrazzo_grey.webp",
  productUrl: "/products/amy-terrazzo-grey",
},
{
  id: "amy-terrazzo-natural",
  name: "Amy Terrazzo Natural",
  brand: "Bellos",
  colour: ["Natural"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-AMY-NAT",
  wallImage: "/visualiser/bathroom/walls/wl_amy_terrazzo_natural.webp",
  floorImage: "/visualiser/bathroom/floors/fl_amy_terrazzo_natural.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/amy_terrazzo_natural.webp",
  productUrl: "/products/amy-terrazzo-natural",
},
{
  id: "amy-terrazzo-white",
  name: "Amy Terrazzo White",
  brand: "Bellos",
  colour: ["White"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-AMY-WHT",
  wallImage: "/visualiser/bathroom/walls/wl_amy_terrazzo_white.webp",
  floorImage: "/visualiser/bathroom/floors/fl_amy_terrazzo_white.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/amy_terrazzo_white.webp",
  productUrl: "/products/amy-terrazzo-white",
},
{
  id: "arena-pearl",
  name: "Arena Pearl",
  brand: "Bellos",
  colour: ["Pearl", "Light Grey"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-ARE-PRL",
  wallImage: "/visualiser/bathroom/walls/wl_arena_pearl.webp",
  floorImage: "/visualiser/bathroom/floors/fl_arena_pearl.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/arena_pearl.webp",
  productUrl: "/products/arena-pearl",
},
{
  id: "city-stone-anthracite",
  name: "City Stone Anthracite",
  brand: "Bellos",
  colour: ["Anthracite", "Dark Grey"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-CIT-ANT",
  wallImage: "/visualiser/bathroom/walls/wl_city_stone_anthracite.webp",
  floorImage: "/visualiser/bathroom/floors/fl_city_stone_anthracite.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/city_stone_anthracite.webp",
  productUrl: "/products/city-stone-anthracite",
},
{
  id: "sanders-dark-grey-polished",
  name: "Sanders Dark Grey Polished",
  brand: "Bellos",
  colour: ["Dark Grey"],
  finishes: ["Polished"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-SAN-DGP",
  wallImage: "/visualiser/bathroom/walls/wl_sanders_dark_grey_polished.webp",
  floorImage: "/visualiser/bathroom/floors/fl_sanders_dark_grey_polished.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/sanders_dark_grey_polished.webp",
  productUrl: "/products/sanderson-dark-grey-polished",
},
{
  id: "atreyo-stone",
  name: "Atreyo Stone",
  brand: "Bellos",
  colour: ["Stone", "Grey"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-ATR-STN",
  wallImage: "/visualiser/bathroom/walls/wl_atreyo_stone.webp",
  floorImage: "/visualiser/bathroom/floors/fl_atreyo_stone.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/atreyo_stone.webp",
  productUrl: "/products/atreyo-stone",
},
{
  id: "bronx-grey",
  name: "Bronx Grey",
  brand: "Bellos",
  colour: ["Grey"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-BRX-GRY",
  wallImage: "/visualiser/bathroom/walls/wl_bronx_grey.webp",
  floorImage: "/visualiser/bathroom/floors/fl_bronx_grey.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/bronx_grey.webp",
  productUrl: "/products/bronx-grey",
},
{
  id: "city-stone-bone",
  name: "City Stone Bone",
  brand: "Bellos",
  colour: ["Bone", "Beige"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-CIT-BON",
  wallImage: "/visualiser/bathroom/walls/wl_city_stone_bone.webp",
  floorImage: "/visualiser/bathroom/floors/fl_city_stone_bone.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/city_stone_bone.webp",
  productUrl: "/products/city-stone-bone",
},
{
  id: "city-stone-clay",
  name: "City Stone Clay",
  brand: "Bellos",
  colour: ["Clay", "Beige"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-CIT-CLY",
  wallImage: "/visualiser/bathroom/walls/wl_city_stone_clay.webp",
  floorImage: "/visualiser/bathroom/floors/fl_city_stone_clay.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/city_stone_clay.webp",
  productUrl: "/products/city-stone-clay",
},
{
  id: "clay-stone-beige",
  name: "Clay Stone Beige",
  brand: "Bellos",
  colour: ["Beige"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-CLY-BEI",
  wallImage: "/visualiser/bathroom/walls/wl_clay_stone_beige.webp",
  floorImage: "/visualiser/bathroom/floors/fl_clay_stone_beige.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/clay_stone_beige.webp",
  productUrl: "/products/clay-stone-beige",
},
{
  id: "clay-stone-grey",
  name: "Clay Stone Grey",
  brand: "Bellos",
  colour: ["Grey"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-CLY-GRY",
  wallImage: "/visualiser/bathroom/walls/wl_clay_stone_grey.webp",
  floorImage: "/visualiser/bathroom/floors/fl_clay_stone_grey.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/clay_stone_grey.webp",
  productUrl: "/products/clay-stone-grey",
},
{
  id: "clay-stone-dark-grey",
  name: "Clay Stone Dark Grey",
  brand: "Bellos",
  colour: ["Dark Grey"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-CLY-DGR",
  wallImage: "/visualiser/bathroom/walls/wl_clay_stone_dark_grey.webp",
  floorImage: "/visualiser/bathroom/floors/fl_clay_stone_dark_grey.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/clay_stone_dark_grey.webp",
  productUrl: "/products/clay-stone-dark-grey",
},
{
  id: "creed-grey",
  name: "Creed Grey",
  brand: "Bellos",
  colour: ["Grey"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-CRD-GRY",
  wallImage: "/visualiser/bathroom/walls/wl_creed_grey.webp",
  floorImage: "/visualiser/bathroom/floors/fl_creed_grey.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/creed_grey.webp",
  productUrl: "/products/creed-grey",
},
{
  id: "curton-beige",
  name: "Curton Beige",
  brand: "Bellos",
  colour: ["Beige"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-CUR-BEI",
  wallImage: "/visualiser/bathroom/walls/wl_curton_beige.webp",
  floorImage: "/visualiser/bathroom/floors/fl_curton_beige.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/curton_beige.webp",
  productUrl: "/products/curton-beige",
},
{
  id: "iceberg",
  name: "Iceberg",
  brand: "Bellos",
  colour: ["White", "Light Grey"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-ICE-WHT",
  wallImage: "/visualiser/bathroom/walls/wl_iceberg.webp",
  floorImage: "/visualiser/bathroom/floors/fl_iceberg.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/iceberg.webp",
  productUrl: "/products/iceberg",
},
{
  id: "lanta-black",
  name: "Lanta Black",
  brand: "Bellos",
  colour: ["Black"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-LAN-BLK",
  wallImage: "/visualiser/bathroom/walls/wl_lanta_black.webp",
  floorImage: "/visualiser/bathroom/floors/fl_lanta_black.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/lanta_black.webp",
  productUrl: "/products/lanta-black",
},
{
  id: "lanta-cream",
  name: "Lanta Cream",
  brand: "Bellos",
  colour: ["Cream"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-LAN-CRM",
  wallImage: "/visualiser/bathroom/walls/wl_lanta_cream.webp",
  floorImage: "/visualiser/bathroom/floors/fl_lanta_cream.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/lanta_cream.webp",
  productUrl: "/products/lanta-cream",
},
{
  id: "lanta-grey",
  name: "Lanta Grey",
  brand: "Bellos",
  colour: ["Grey"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-LAN-GRY",
  wallImage: "/visualiser/bathroom/walls/wl_lanta_grey.webp",
  floorImage: "/visualiser/bathroom/floors/fl_lanta_grey.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/lanta_grey.webp",
  productUrl: "/products/lanta-grey",
},
{
  id: "lanta-white",
  name: "Lanta White",
  brand: "Bellos",
  colour: ["White"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-LAN-WHT",
  wallImage: "/visualiser/bathroom/walls/wl_lanta_white.webp",
  floorImage: "/visualiser/bathroom/floors/fl_lanta_white.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/lanta_white.webp",
  productUrl: "/products/lanta-white",
},
{
  id: "rosko-anthracite",
  name: "Rosko Anthracite",
  brand: "Bellos",
  colour: ["Anthracite", "Dark Grey"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-ROS-ANT",
  wallImage: "/visualiser/bathroom/walls/wl_rosko_anthracite.webp",
  floorImage: "/visualiser/bathroom/floors/fl_rosko_anthracite.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/rosko_anthracite.webp",
  productUrl: "/products/rosko-anthracite",
},
{
  id: "rosko-cream",
  name: "Rosko Cream",
  brand: "Bellos",
  colour: ["Cream"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-ROS-CRM",
  wallImage: "/visualiser/bathroom/walls/wl_rosko_cream.webp",
  floorImage: "/visualiser/bathroom/floors/fl_rosko_cream.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/rosko_cream.webp",
  productUrl: "/products/rosko-cream",
},
{
  id: "rosko-grey",
  name: "Rosko Grey",
  brand: "Bellos",
  colour: ["Grey"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-ROS-GRY",
  wallImage: "/visualiser/bathroom/walls/wl_rosko_grey.webp",
  floorImage: "/visualiser/bathroom/floors/fl_rosko_grey.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/rosko_grey.webp",
  productUrl: "/products/rosko-grey",
},
{
  id: "rosko-mink",
  name: "Rosko Mink",
  brand: "Bellos",
  colour: ["Mink", "Beige"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-ROS-MNK",
  wallImage: "/visualiser/bathroom/walls/wl_rosko_mink.webp",
  floorImage: "/visualiser/bathroom/floors/fl_rosko_mink.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/rosko_mink.webp",
  productUrl: "/products/rosko-mink",
},
{
  id: "ridge-gloss",
  name: "Ridge Gloss",
  brand: "Bellos",
  colour: ["White"],
  finishes: ["Gloss"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-RDG-GLS",
  wallImage: "/visualiser/bathroom/walls/wl_ridge_gloss.webp",
  floorImage: "/visualiser/bathroom/floors/fl_ridge_gloss.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/ridge_gloss.webp",
  productUrl: "/products/ridge-gloss",
},
{
  id: "sanders-light-grey-matt",
  name: "Sanders Light Grey Matt",
  brand: "Bellos",
  colour: ["Light Grey"],
  finishes: ["Matt"],
  sizes: ["600x600", "600x1200"],
  material: "Porcelain",
  suitability: "Indoor",
  sku: "BEL-SAN-LGM",
  wallImage: "/visualiser/bathroom/walls/wl_sanders_light_grey_matt.webp",
  floorImage: "/visualiser/bathroom/floors/fl_sanders_light_grey_matt.webp",
  thumbnail: "/visualiser/bathroom/thumbnails/sanders_light_grey_matt.webp",
  productUrl: "/products/sanderson-light-grey-matt",
}




];




/* =====================================================
   DOM REFERENCES
===================================================== */

let wallImg: HTMLImageElement | null = null;
let floorImg: HTMLImageElement | null = null;
let listContainer: HTMLElement | null = null;
let searchInputs: HTMLInputElement[] = [];
let productModal: HTMLElement | null = null;
let productModalContent: HTMLElement | null = null;


const BASE_WALL_SRC = "/visualiser/bathroom/base_wall.png";
const BASE_FLOOR_SRC = "/visualiser/bathroom/base_floor.png";
let scaleQueued = false;
let cycleQueued = false;

/* =====================================================
   INIT
===================================================== */

export function initBathroom() {
  if (BATHROOM_INITIALISED) return;
  BATHROOM_INITIALISED = true;

  listContainer = getActiveContainer();

window.addEventListener("resize", () => {
  renderTileList(TILES);
});


  wallImg = document.getElementById("bathroom-wall-layer") as HTMLImageElement;
  floorImg = document.getElementById("bathroom-floor-layer") as HTMLImageElement;

  function getActiveContainer(): HTMLElement | null {
  if (window.innerWidth < 768) {
    return document.getElementById("bathroom-tile-list-mobile");
  }
  return document.getElementById("bathroom-tile-list-desktop");
}

  searchInputs = [
    document.getElementById("bathroom-search") as HTMLInputElement,
    document.getElementById("bathroom-search-mobile-top") as HTMLInputElement,
  ].filter(Boolean);

  if (!wallImg || !floorImg || !listContainer) {
    console.warn("Bathroom visualiser DOM not ready");
    return;
  }

  
  wallImg.src = BASE_WALL_SRC;
  floorImg.src = BASE_FLOOR_SRC;
  queueLayerScale();
 

  renderTileList(TILES);
  bindSearch();
  createProductModal();
  bindApplyModeButtons();
  updateApplyModeUI();
  bindChevronControls();
  bindCycleWindowHooks();
  emitLoaded();
}

/* =====================================================
   APPLY TILE
===================================================== */

function applyTile(tile: TileProduct, index?: number) {
  activeTileId = tile.id;
const nameDisplay = document.getElementById("bathroom-active-name");
if (nameDisplay) {
  nameDisplay.textContent = tile.name;
}
  if (typeof index === "number") {
    activeTileIndex = index;
  } else {
    activeTileIndex = TILES.findIndex((t) => t.id === tile.id);
  }

  if (applyMode === "set" || applyMode === "walls") {
    wallImg!.src = tile.wallImage;
  }

  if (applyMode === "set" || applyMode === "floor") {
    floorImg!.src = tile.floorImage;
  }

  window.dispatchEvent(
    new CustomEvent<{ name: string }>("bathroom-active-tile", {
      detail: { name: tile.name },
    })
  );

  queueLayerScale();
  updateMobileSelection();
}

function queueLayerScale() {
  if (scaleQueued) return;
  scaleQueued = true;
  requestAnimationFrame(() => {
    scaleQueued = false;
    syncLayerScale();
  });
}

function syncLayerScale() {
  if (!wallImg || !floorImg) return;

  const update = () => {
    if (!wallImg?.naturalWidth || !floorImg?.naturalWidth) return;
    const scaleX = wallImg.naturalWidth / floorImg.naturalWidth;
    floorImg.style.transformOrigin = "center center";
    floorImg.style.transform = `scaleX(${scaleX})`;
  };

  if (wallImg.complete && floorImg.complete) {
    update();
    return;
  }

  wallImg.onload = update;
  floorImg.onload = update;
}



/* =====================================================
   TILE CYCLING
===================================================== */
function applyNextTile() {
  if (cycleQueued) return;
  cycleQueued = true;
  requestAnimationFrame(() => {
    cycleQueued = false;
    applyNextTileImmediate();
  });
}

function applyNextTileImmediate() {
  if (!TILES.length) return;

  if (activeTileIndex === -1) {
    applyTile(TILES[0], 0);
    return;
  }

  const nextIndex = (activeTileIndex + 1) % TILES.length;
  applyTile(TILES[nextIndex], nextIndex);
}

function applyPreviousTile() {
  if (cycleQueued) return;
  cycleQueued = true;
  requestAnimationFrame(() => {
    cycleQueued = false;
    applyPreviousTileImmediate();
  });
}

function applyPreviousTileImmediate() {
  if (!TILES.length) return;

  if (activeTileIndex === -1) {
    applyTile(TILES[0], 0);
    return;
  }

  const prevIndex =
    (activeTileIndex - 1 + TILES.length) % TILES.length;

  applyTile(TILES[prevIndex], prevIndex);
}


function bindChevronControls() {
  const prevBtn = document.getElementById("bathroom-prev-tile");
  const nextBtn = document.getElementById("bathroom-next-tile");

  prevBtn?.addEventListener("click", applyPreviousTile);
  nextBtn?.addEventListener("click", applyNextTile);
}

function bindCycleWindowHooks() {
  (window as any).bathroomCycleNext = applyNextTile;
  (window as any).bathroomCyclePrev = applyPreviousTile;
}



/* =====================================================
   UI RENDERING
===================================================== */

/* =====================================================
   UI RENDERING (DESKTOP + MOBILE)
===================================================== */

function getActiveContainer(): HTMLElement | null {
  if (typeof window === "undefined") return null;

  if (window.innerWidth < 768) {
    return document.getElementById("bathroom-tile-list-mobile");
  }

  return document.getElementById("bathroom-tile-list-desktop");
}

function renderTileList(tiles: TileProduct[]) {
  
  
  
  
  listContainer = getActiveContainer();
if (!listContainer) return;

  listContainer.innerHTML = "";

  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    renderMobileStrip(tiles);
    return;
  }

  // DESKTOP LIST VIEW
  tiles.forEach((tile, index) => {
    const card = document.createElement("div");
    card.className =
      "p-3 border rounded-lg bg-white hover:shadow-md transition";

    card.innerHTML = `
      <div class="flex gap-3">
        <img src="${tile.thumbnail}" class="w-16 h-16 object-cover rounded" />
        <div class="flex-1">
          <div class="font-semibold text-sm">${tile.name}</div>
          <div class="text-xs text-gray-500">${tile.sizes.join(", ")}</div>
          <div class="text-xs text-gray-500">${tile.finishes.join(", ")}</div>
          <div class="flex justify-between items-center mt-2">
            <button class="text-xs text-black underline"
              data-apply="${index}">
              Apply
            </button>
            <button class="text-xs text-gray-500 underline"
              data-info="${index}">
              More product info
            </button>
          </div>
        </div>
      </div>
    `;

    listContainer!.appendChild(card);
  });

  bindDesktopEvents(tiles);
}

function renderMobileStrip(tiles: TileProduct[]) {
  if (!listContainer) return;

  listContainer.innerHTML = `
    <div class="flex gap-4 overflow-x-auto pb-4">
      ${tiles
        .map(
          (tile, index) => `
        <button
          type="button"
          data-id="${tile.id}"
          data-index="${index}"
          class="shrink-0 rounded-lg border p-1 bg-white ${
            tile.id === activeTileId ? "border-black" : "border-gray-300"
          }"
        >
          <img
            src="${tile.thumbnail}"
            alt="${tile.name}"
            class="w-20 h-20 object-cover rounded"
          />
        </button>
      `
        )
        .join("")}
    </div>
  `;

  listContainer
    ?.querySelectorAll("button[data-id]")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const el = e.currentTarget as HTMLElement;
        const id = el.getAttribute("data-id");
        const indexAttr = el.getAttribute("data-index");
        const index =
          typeof indexAttr === "string" ? Number(indexAttr) : undefined;
        const tile = tiles.find((t) => t.id === id);
        if (!tile) return;
        applyTile(tile, index);
        openProductModal(tile);
      });
    });

  updateMobileSelection();
}

function updateMobileSelection() {
  if (!listContainer || activeTileIndex < 0) return;

  const buttons = Array.from(
    listContainer.querySelectorAll("button[data-id]")
  ) as HTMLElement[];

  buttons.forEach((btn) => {
    const id = btn.getAttribute("data-id");
    if (id === activeTileId) {
      btn.classList.add("border-black");
      btn.classList.remove("border-gray-300");
    } else {
      btn.classList.remove("border-black");
      btn.classList.add("border-gray-300");
    }
  });

  const activeBtn = buttons.find(
    (btn) => btn.getAttribute("data-id") === activeTileId
  );
  if (activeBtn) {
    activeBtn.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }
}

function bindDesktopEvents(tiles: TileProduct[]) {
  listContainer
    ?.querySelectorAll("[data-apply]")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const i = Number(
          (e.currentTarget as HTMLElement).getAttribute("data-apply")
        );
        applyTile(tiles[i], i);
      });
    });

  listContainer
    ?.querySelectorAll("[data-info]")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const i = Number(
          (e.currentTarget as HTMLElement).getAttribute("data-info")
        );
        openProductModal(tiles[i]);
      });
    });
}


/* =====================================================
   SEARCH
===================================================== */

function bindSearch() {
  if (!searchInputs.length) return;

  const handler = (value: string) => {
    const q = value.toLowerCase();
    const filtered = TILES.filter((t) =>
      `${t.name} ${t.colour.join(" ")} ${t.finishes.join(" ")}`
        .toLowerCase()
        .includes(q)
    );
    renderTileList(filtered);
  };

  searchInputs.forEach((input) => {
    input.oninput = () => handler(input.value);
  });
}

/* =====================================================
   APPLY MODE BUTTONS
===================================================== */

function bindApplyModeButtons() {
  document
    .querySelectorAll("[data-apply-mode]")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        applyMode = btn.getAttribute("data-apply-mode") as ApplyMode;
        updateApplyModeUI();

        // Re-apply active tile if exists
        if (activeTileId) {
          const tile = TILES.find((t) => t.id === activeTileId);
          if (tile) applyTile(tile);
        }
      });
    });
}

function updateApplyModeUI() {
  document
    .querySelectorAll("[data-apply-mode]")
    .forEach((btn) => {
      const mode = btn.getAttribute("data-apply-mode");
      const isActive = mode === applyMode;
      btn.classList.toggle("bg-black", isActive);
      btn.classList.toggle("text-white", isActive);
      btn.classList.toggle("border-black", isActive);
      btn.classList.toggle("bg-white", !isActive);
      btn.classList.toggle("text-gray-700", !isActive);
    });
}

/* =====================================================
   LOADER EVENTS (COMPAT)
===================================================== */

function emitLoaded() {
  window.dispatchEvent(new Event("bathroom-loaded"));
}

export function destroyBathroom() {
  BATHROOM_INITIALISED = false;
  if (typeof window !== "undefined") {
    delete (window as any).bathroomCycleNext;
    delete (window as any).bathroomCyclePrev;
  }
}

/* =====================================================
   PRODUCT MODAL
===================================================== */

function createProductModal() {
  if (productModal) return;

  productModal = document.createElement("div");
  productModal.className =
    "fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]";
  productModal.style.display = "none";

  productModal.innerHTML = `
    <div class="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
      <div class="flex justify-between items-center p-4 border-b">
        <h2 class="text-lg font-semibold">Product Details</h2>
        <button id="bathroom-modal-close" class="text-gray-500 text-xl">&times;</button>
      </div>
      <div id="bathroom-modal-content" class="p-6 space-y-4 overflow-y-auto max-h-[70vh]"></div>
    </div>
  `;

  document.body.appendChild(productModal);

  productModalContent = document.getElementById(
    "bathroom-modal-content"
  ) as HTMLElement;

  document
    .getElementById("bathroom-modal-close")
    ?.addEventListener("click", closeProductModal);

  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) closeProductModal();
  });
}

function openProductModal(tile: TileProduct) {
  if (!productModalContent) return;

  productModal!.style.display = "flex";

  productModalContent.innerHTML = `
    <div class="flex gap-6 flex-col md:flex-row">
      <img src="${tile.thumbnail}" class="w-full md:w-48 rounded-lg border" />
      <div class="space-y-2">
        <div class="text-xl font-semibold">${tile.name}</div>
        <div class="text-sm text-gray-500">${tile.brand}</div>
        <div class="text-sm"><strong>SKU:</strong> ${tile.sku}</div>
        <div class="text-sm"><strong>Material:</strong> ${tile.material}</div>
        <div class="text-sm"><strong>Suitability:</strong> ${tile.suitability}</div>
        <div class="text-sm"><strong>Colour:</strong> ${tile.colour.join(", ")}</div>
        <div class="text-sm"><strong>Finish:</strong> ${tile.finishes.join(", ")}</div>
        <div class="text-sm"><strong>Sizes:</strong> ${tile.sizes.join(", ")}</div>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-6 border-t">
      <button id="bathroom-modal-back"
        class="px-4 py-2 border rounded-lg text-sm">
        Back
      </button>
      <a href="${tile.productUrl}"
        class="px-4 py-2 bg-black text-white rounded-lg text-sm">
        Go to product page
      </a>
    </div>
  `;

  document
    .getElementById("bathroom-modal-back")
    ?.addEventListener("click", closeProductModal);
}

function closeProductModal() {
  if (!productModal) return;
  productModal.style.display = "none";
}
