"use client";

/* =====================================================
   STATE
===================================================== */

let BF_INITIALISED = false;
let activeTileId: string | null = null;
let activeTileIndex: number = -1;

/* =====================================================
   TILE DATA
===================================================== */

type FloorTileProduct = {
  id: string;
  name: string;
  brand: string;
  colour: string;
  finishes: string;
  sizes: string;
  material: string;
  suitability: string;
  sku: string;
  floorImage: string;
  thumbnail: string;
  productUrl: string;
};

const TILES: FloorTileProduct[] = [
  {
    id: "alpaca",
    name: "Alpaca",
    brand: "Bellos",
    colour: "White",
    finishes: "Lappato",
    sizes: "800x800",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-ALP",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-alpaca-white.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/alpaca_white.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/alpaca-white-800x800",
  },
  {
    id: "amani-marble-light-grey",
    name: "Amani Marble Light Grey",
    brand: "RAK",
    colour: "Light Grey",
    finishes: "Polished",
    sizes: "600x600",
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-AMA",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-amani-marble-light-grey.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/amani_marble_light_grey.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/amani-marble-light-grey-600x600",
  },
  {
    id: "amy-terrazzo-beige",
    name: "Amy Terrazzo Beige",
    brand: "Bellos",
    colour: "Beige",
    finishes: "Matt",
    sizes: "900x900",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-AMB",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-amy-terrazzo-beige.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/amy_terrazzo_beige.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/amy-terrazzo-beige-900x900",
  },
  {
    id: "amy-terrazzo-grey",
    name: "Amy Terrazzo Grey",
    brand: "Bellos",
    colour: "Grey",
    finishes: "Matt",
    sizes: "900x900",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-AMG",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-amy-terrazzo-grey.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/amy_terrazzo_grey.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/amy-terrazzo-grey-900x900",
  },
  {
    id: "amy-terrazzo-natural",
    name: "Amy Terrazzo Natural",
    brand: "Bellos",
    colour: "Natural",
    finishes: "Matt",
    sizes: "900x900",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-AMN",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-amy-terrazzo-natural.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/amy_terrazzo_natural.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/amy-terrazzo-natural-900x900",
  },
  {
    id: "amy-terrazzo-white",
    name: "Amy Terrazzo White",
    brand: "Bellos",
    colour: "White",
    finishes: "Matt",
    sizes: "900x900",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-AMW",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-amy-terrazzo-white.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/amy_terrazzo_white.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/amy-terrazzo-white-900x900",
  },
  {
    id: "breccia-adige-grey",
    name: "Breccia Adige Grey",
    brand: "RAK",
    colour: "Grey",
    finishes: "Polished",
    sizes: "600x600",
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-BRE",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-breccia-adige-grey.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/breccia_adige.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/breccia-adige-grey-600x600",
  },
  {
    id: "calacatta-africa-white",
    name: "Calacatta Africa White",
    brand: "RAK",
    colour: "White",
    finishes: "Polished",
    sizes: "1200x1200",
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-CAA",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-calacatta-africa-white.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/calacatta_africa_white.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/calacatta-africa-white-1200x1200",
  },
  {
    id: "calacatta-gold-white",
    name: "Calacatta Gold White",
    brand: "RAK",
    colour: "White",
    finishes: "Polished",
    sizes: "1200x1200",
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-CAG",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-calacatta-gold-white.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/calacatta_gold_white.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/calacatta-gold-white-1200x1200",
  },
  {
    id: "carmo-stone-cool-grey",
    name: "Carmo Stone Cool Grey",
    brand: "RAK",
    colour: "Cool Grey",
    finishes: "Matt",
    sizes: "600x600",
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-CAR",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-carmo-stone-cool-grey.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/carmo_stone_grey.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/carmo-stone-cool-grey-600x600",
  },
  {
    id: "city-stone-bone",
    name: "City Stone Bone",
    brand: "Bellos",
    colour: "Bone",
    finishes: "Matt",
    sizes: "600x600",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-CSB",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-city-stone-bone.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/city_stone_bone.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/city-stone-bone-600x600",
  },
  {
    id: "city-stone-clay",
    name: "City Stone Clay",
    brand: "Bellos",
    colour: "Clay",
    finishes: "Matt",
    sizes: "600x600",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-CSC",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-city-stone-clay.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/city_stone_clay.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/city-stone-clay-600x600",
  },
  {
    id: "city-stone-white",
    name: "City Stone White",
    brand: "Bellos",
    colour: "White",
    finishes: "Matt",
    sizes: "600x600",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-CSW",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-city-stone-white.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/city_stone_bone.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/city-stone-white-600x600",
  },
  {
    id: "creed-grey",
    name: "Creed Grey",
    brand: "Bellos",
    colour: "Grey",
    finishes: "Matt",
    sizes: "600x600",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-CRE",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-creed-grey.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/creed_grey.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/creed-grey-600x600",
  },
  {
    id: "curton-beige",
    name: "Curton Beige",
    brand: "Bellos",
    colour: "Beige",
    finishes: "Matt",
    sizes: "600x600",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-CUR",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-curton-beige.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/curton_beige.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/curton-beige-600x600",
  },
  {
    id: "medicea-marble",
    name: "Medicea Marble",
    brand: "Bellos",
    colour: "White",
    finishes: "Polished",
    sizes: "600x1200",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-MED",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-medicea-marble.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/medicea_marble.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/medicea-marble-600x1200",
  },
  {
    id: "panda-marble",
    name: "Panda Marble",
    brand: "Bellos",
    colour: "White",
    finishes: "Polished",
    sizes: "600x1200",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-PAN",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-panda-marble.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/panda_marble.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/panda-marble-600x1200",
  },
  {
    id: "rosko-anthracite",
    name: "Rosko Anthracite",
    brand: "Bellos",
    colour: "Anthracite",
    finishes: "Matt",
    sizes: "297x597",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-ROA",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-rosko-anthracite.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/rosko_anthracite.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/rosko-anthracite-297x597",
  },
  {
    id: "rosko-cream",
    name: "Rosko Cream",
    brand: "Bellos",
    colour: "Cream",
    finishes: "Matt",
    sizes: "297x597",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-ROC",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-rosko-cream.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/rosko_cream.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/rosko-cream-297x597",
  },
  {
    id: "rosko-grey",
    name: "Rosko Grey",
    brand: "Bellos",
    colour: "Grey",
    finishes: "Matt",
    sizes: "297x597",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-ROG",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-rosko-grey.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/rosko_grey.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/rosko-grey-297x597",
  },
  {
    id: "rosko-mink",
    name: "Rosko Mink",
    brand: "Bellos",
    colour: "Mink",
    finishes: "Matt",
    sizes: "297x597",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-ROM",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-rosko-mink.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/rosko_mink.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/rosko-mink-297x597",
  },
  {
    id: "sanders-polished",
    name: "Sanders /polished",
    brand: "Bellos",
    colour: "Dark Grey",
    finishes: "Polished",
    sizes: "600x600",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-SAG",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-sanders-gloss.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/sanders_dark_grey_polished.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/sanderson-dark-grey-polished-600x600",
  },
  {
    id: "sanders-matt",
    name: "Sanders Matt",
    brand: "Bellos",
    colour: "Light Grey",
    finishes: "Matt",
    sizes: "600x600",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-SAM",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-sanders-matt.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/sanders_light_grey_matt.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/sanderson-light-grey-matt-600x600",
  },
  {
    id: "surface-2-0-sand",
    name: "Surface 2.0 Sand",
    brand: "RAK",
    colour: "Sand",
    finishes: "Matt",
    sizes: "600x600",
    material: "Glazed Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-SUR",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-surface-2-0-sand.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/surface_2_0_sand.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/surface-2-0-sand-600x600",
  },
  {
    id: "venus-emerald",
    name: "Venus Emerald",
    brand: "Bellos",
    colour: "Emerald",
    finishes: "Polished",
    sizes: "600x600",
    material: "Porcelain",
    suitability: "Indoor",
    sku: "BEL-VER-VEN",
    floorImage: "/visualiser/25-popular-bathroom-floors-tiles/bathroom-floor-venus_emerald.webp",
    thumbnail: "/visualiser/bathroom/thumbnails/venus_emerald.webp",
    productUrl: "https://bellosbespoketiles.co.uk/products/venus-emerald-600x600",
  },
];


/* =====================================================
   DOM REFERENCES
===================================================== */

let floorImg: HTMLImageElement | null = null;
let listContainer: HTMLElement | null = null;
let searchInputs: HTMLInputElement[] = [];
let productModal: HTMLElement | null = null;
let productModalContent: HTMLElement | null = null;

let scaleQueued = false;
let cycleQueued = false;
let preloadStarted = false;


/* =====================================================
   INIT
===================================================== */

export function initBathroomFloors() {
  if (BF_INITIALISED) return;
  BF_INITIALISED = true;

  listContainer = getActiveContainer();

  window.addEventListener("resize", () => {
    renderTileList(TILES);
  });

  floorImg = document.getElementById("bf-floor-layer") as HTMLImageElement;

  searchInputs = [
    document.getElementById("bf-search") as HTMLInputElement,
    document.getElementById("bf-search-mobile-top") as HTMLInputElement,
  ].filter(Boolean);

  if (!floorImg || !listContainer) {
    console.warn("Bathroom floors visualiser DOM not ready");
    return;
  }

  // Show first tile by default
  if (TILES.length) {
    floorImg.src = TILES[0].floorImage;
    activeTileId = TILES[0].id;
    activeTileIndex = 0;
  }

  renderTileList(TILES);
  bindSearch();
  createProductModal();
  bindChevronControls();
  bindCycleWindowHooks();
  startPreload();
}


/* =====================================================
   APPLY TILE
===================================================== */

function applyTile(tile: FloorTileProduct, index?: number) {
  activeTileId = tile.id;

  const nameDisplay = document.getElementById("bf-active-name");
  if (nameDisplay) {
    nameDisplay.textContent = tile.name;
  }

  if (typeof index === "number") {
    activeTileIndex = index;
  } else {
    activeTileIndex = TILES.findIndex((t) => t.id === tile.id);
  }

  floorImg!.src = tile.floorImage;

  window.dispatchEvent(
    new CustomEvent<{ name: string }>("bf-active-tile", {
      detail: { name: tile.name },
    })
  );

  updateMobileSelection();
}


/* =====================================================
   PRELOAD
===================================================== */

function startPreload() {
  if (preloadStarted) return;
  preloadStarted = true;

  const urls = new Set<string>();
  TILES.forEach((tile) => {
    urls.add(tile.floorImage);
    urls.add(tile.thumbnail);
  });

  const list = Array.from(urls);
  if (!list.length) {
    emitProgress(100);
    emitLoaded();
    return;
  }

  emitProgress(0);

  let loaded = 0;
  const total = list.length;

  const handleDone = () => {
    loaded += 1;
    const progress = Math.round((loaded / total) * 100);
    emitProgress(progress);
    if (loaded >= total) {
      emitLoaded();
    }
  };

  list.forEach((src) => {
    const img = new Image();
    img.onload = handleDone;
    img.onerror = handleDone;
    img.src = src;
  });
}


/* =====================================================
   TILE CYCLING
===================================================== */

function applyNextTile() {
  if (cycleQueued) return;
  cycleQueued = true;
  requestAnimationFrame(() => {
    cycleQueued = false;
    if (!TILES.length) return;
    if (activeTileIndex === -1) {
      applyTile(TILES[0], 0);
      return;
    }
    const nextIndex = (activeTileIndex + 1) % TILES.length;
    applyTile(TILES[nextIndex], nextIndex);
  });
}

function applyPreviousTile() {
  if (cycleQueued) return;
  cycleQueued = true;
  requestAnimationFrame(() => {
    cycleQueued = false;
    if (!TILES.length) return;
    if (activeTileIndex === -1) {
      applyTile(TILES[0], 0);
      return;
    }
    const prevIndex = (activeTileIndex - 1 + TILES.length) % TILES.length;
    applyTile(TILES[prevIndex], prevIndex);
  });
}

function bindChevronControls() {
  const prevBtn = document.getElementById("bf-prev-tile");
  const nextBtn = document.getElementById("bf-next-tile");
  prevBtn?.addEventListener("click", applyPreviousTile);
  nextBtn?.addEventListener("click", applyNextTile);
}

function bindCycleWindowHooks() {
  (window as any).bfCycleNext = applyNextTile;
  (window as any).bfCyclePrev = applyPreviousTile;
}


/* =====================================================
   UI RENDERING (DESKTOP + MOBILE)
===================================================== */

function getActiveContainer(): HTMLElement | null {
  if (typeof window === "undefined") return null;
  if (window.innerWidth < 768) {
    return document.getElementById("bf-tile-list-mobile");
  }
  return document.getElementById("bf-tile-list-desktop");
}

function renderTileList(tiles: FloorTileProduct[]) {
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
      "flex gap-3 px-4 py-3 border-b border-[#E8E5E0] hover:bg-white transition-colors";

    card.innerHTML = `
      <div class="w-14 h-14 shrink-0 bg-[#EEECE9] overflow-hidden">
        <img src="${tile.thumbnail}" class="w-full h-full object-cover" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-xs font-light text-[#1A1A1A] tracking-wide leading-snug truncate">${tile.name}</div>
        <div class="text-[10px] tracking-[0.15em] uppercase text-[#9A7A5E] mt-1">${tile.sizes}</div>
        <div class="text-[10px] tracking-[0.15em] uppercase text-[#9A7A5E]">${tile.finishes}</div>
        <div class="flex items-center gap-4 mt-2">
          <button class="text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-px hover:text-[#9A7A5E] hover:border-[#9A7A5E] transition-colors"
            data-apply="${index}">
            Apply
          </button>
          <button class="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] border-b border-[#9A7A5E] pb-px hover:text-[#7A5E44] hover:border-[#7A5E44] transition-colors"
            data-info="${index}">
            More Info
          </button>
        </div>
      </div>
    `;

    listContainer!.appendChild(card);
  });

  bindDesktopEvents(tiles);
}

function renderMobileStrip(tiles: FloorTileProduct[]) {
  if (!listContainer) return;

  listContainer.innerHTML = `
    <div class="flex gap-2 overflow-x-auto pb-2">
      ${tiles
        .map(
          (tile, index) => `
        <button
          type="button"
          data-id="${tile.id}"
          data-index="${index}"
          class="shrink-0 border-2 bg-[#EEECE9] overflow-hidden transition-colors ${
            tile.id === activeTileId ? "border-[#9A7A5E]" : "border-transparent"
          }"
        >
          <img
            src="${tile.thumbnail}"
            alt="${tile.name}"
            class="w-16 h-16 object-cover"
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
      btn.classList.add("border-[#9A7A5E]");
      btn.classList.remove("border-transparent");
    } else {
      btn.classList.remove("border-[#9A7A5E]");
      btn.classList.add("border-transparent");
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

function bindDesktopEvents(tiles: FloorTileProduct[]) {
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
      `${t.name} ${t.colour} ${t.finishes}`
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
   LOADER EVENTS
===================================================== */

function emitLoaded() {
  window.dispatchEvent(new Event("bf-loaded"));
}

function emitProgress(progress: number) {
  window.dispatchEvent(
    new CustomEvent<{ progress: number }>("bf-progress", {
      detail: { progress },
    })
  );
}

export function destroyBathroomFloors() {
  BF_INITIALISED = false;
  if (typeof window !== "undefined") {
    delete (window as any).bfCycleNext;
    delete (window as any).bfCyclePrev;
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
    <div class="bg-white w-full max-w-md mx-4 shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-[#E8E5E0]">
        <div class="flex items-center gap-3">
          <p class="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">Product Details</p>
          <div class="w-12 h-px bg-[#E8E5E0]"></div>
        </div>
        <button id="bf-modal-close" class="w-7 h-7 flex items-center justify-center text-[#9A7A5E] hover:text-[#1A1A1A] transition-colors text-xl leading-none">&times;</button>
      </div>
      <div id="bf-modal-content" class="overflow-y-auto max-h-[80vh]"></div>
    </div>
  `;

  document.body.appendChild(productModal);

  productModalContent = document.getElementById(
    "bf-modal-content"
  ) as HTMLElement;

  document
    .getElementById("bf-modal-close")
    ?.addEventListener("click", closeProductModal);

  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) closeProductModal();
  });
}

function openProductModal(tile: FloorTileProduct) {
  if (!productModalContent) return;

  productModal!.style.display = "flex";

  productModalContent.innerHTML = `
    <div class="flex gap-4 px-6 py-5 border-b border-[#E8E5E0]">
      <div class="w-20 h-20 shrink-0 bg-[#EEECE9] overflow-hidden">
        <img src="${tile.thumbnail}" class="w-full h-full object-cover" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-light text-[#1A1A1A] tracking-wide leading-snug mb-1">${tile.name}</p>
        <p class="text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">${tile.brand}</p>
      </div>
    </div>

    <div class="px-6 py-1 border-b border-[#E8E5E0]">
      <div class="grid grid-cols-5 gap-3 py-2.5 border-b border-[#E8E5E0]">
        <p class="col-span-2 text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">SKU</p>
        <p class="col-span-3 text-xs text-[#1A1A1A] font-light">${tile.sku}</p>
      </div>
      <div class="grid grid-cols-5 gap-3 py-2.5 border-b border-[#E8E5E0]">
        <p class="col-span-2 text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">Material</p>
        <p class="col-span-3 text-xs text-[#1A1A1A] font-light">${tile.material}</p>
      </div>
      <div class="grid grid-cols-5 gap-3 py-2.5 border-b border-[#E8E5E0]">
        <p class="col-span-2 text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">Suitability</p>
        <p class="col-span-3 text-xs text-[#1A1A1A] font-light">${tile.suitability}</p>
      </div>
      <div class="grid grid-cols-5 gap-3 py-2.5 border-b border-[#E8E5E0]">
        <p class="col-span-2 text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">Colour</p>
        <p class="col-span-3 text-xs text-[#1A1A1A] font-light">${tile.colour}</p>
      </div>
      <div class="grid grid-cols-5 gap-3 py-2.5 border-b border-[#E8E5E0]">
        <p class="col-span-2 text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">Finish</p>
        <p class="col-span-3 text-xs text-[#1A1A1A] font-light">${tile.finishes}</p>
      </div>
      <div class="grid grid-cols-5 gap-3 py-2.5">
        <p class="col-span-2 text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">Sizes</p>
        <p class="col-span-3 text-xs text-[#1A1A1A] font-light">${tile.sizes}</p>
      </div>
    </div>

    <div class="flex gap-3 px-6 py-5">
      <button id="bf-modal-back"
        class="flex-1 py-3 border border-[#D4CFC8] text-[10px] tracking-[0.2em] uppercase text-[#1A1A1A] hover:border-[#9A7A5E] hover:text-[#9A7A5E] transition-colors">
        Back
      </button>
      <a href="${tile.productUrl}" target="_blank" rel="noopener noreferrer"
        class="flex-1 py-3 bg-[#1A1A1A] text-white text-[10px] tracking-[0.2em] uppercase text-center hover:bg-[#2A2A2A] transition-colors">
        View Product
      </a>
    </div>
  `;

  document
    .getElementById("bf-modal-back")
    ?.addEventListener("click", closeProductModal);
}

function closeProductModal() {
  if (!productModal) return;
  productModal.style.display = "none";
}
