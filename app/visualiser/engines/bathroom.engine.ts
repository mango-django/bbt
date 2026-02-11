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
    wallImage: "/visualiser/bathroom/walls/wl_amani_marble_dark_grey.png",
    floorImage: "/visualiser/bathroom/floors/fl_amani_marble_dark_grey.png",
    thumbnail: "/visualiser/bathroom/thumbnails/amani_marble_dark_grey.png",
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
    wallImage: "/visualiser/bathroom/walls/wl_amani_marble_light_grey.png",
    floorImage: "/visualiser/bathroom/floors/fl_amani_marble_light_grey.png",
    thumbnail: "/visualiser/bathroom/thumbnails/amani_marble_light_grey.png",
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
    wallImage: "/visualiser/bathroom/walls/wl_breccia_adige.png",
    floorImage: "/visualiser/bathroom/floors/fl_breccia_adige.png",
    thumbnail: "/visualiser/bathroom/thumbnails/breccia_adige.png",
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
    wallImage: "/visualiser/bathroom/walls/wl_calacatta_africa_white.png",
    floorImage: "/visualiser/bathroom/floors/fl_calacatta_africa_white.png",
    thumbnail: "/visualiser/bathroom/thumbnails/calacatta_africa_white.png",
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
    wallImage: "/visualiser/bathroom/walls/wl_calacatta_gold_white.png",
    floorImage: "/visualiser/bathroom/floors/fl_calacatta_gold_white.png",
    thumbnail: "/visualiser/bathroom/thumbnails/calacatta_gold_white.png",
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
    wallImage: "/visualiser/bathroom/walls/wl_carmo_stone_black.png",
    floorImage: "/visualiser/bathroom/floors/fl_carmo_stone_black.png",
    thumbnail: "/visualiser/bathroom/thumbnails/carmo_stone_black.png",
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
    wallImage: "/visualiser/bathroom/walls/wl_carmo_stone_grey.png",
    floorImage: "/visualiser/bathroom/floors/fl_carmo_stone_grey.png",
    thumbnail: "/visualiser/bathroom/thumbnails/carmo_stone_grey.png",
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
    wallImage: "/visualiser/bathroom/walls/wl_carmo_stone_ivory.png",
    floorImage: "/visualiser/bathroom/floors/fl_carmo_stone_ivory.png",
    thumbnail: "/visualiser/bathroom/thumbnails/carmo_stone_ivory.png",
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
    wallImage: "/visualiser/bathroom/walls/wl_carmo-stone-anthracite.png",
    floorImage: "/visualiser/bathroom/floors/fl_carmo-stone-anthracite.png",
    thumbnail: "/visualiser/bathroom/thumbnails/carmo_stone_anthracite.png",
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
    wallImage: "/visualiser/bathroom/walls/wl_classic_carrera.png",
    floorImage: "/visualiser/bathroom/floors/fl_classic_carrera.png",
    thumbnail: "/visualiser/bathroom/thumbnails/classic_carrera.png",
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
    wallImage: "/visualiser/bathroom/walls/wl_surface_2.0_ash.png",
    floorImage: "/visualiser/bathroom/floors/fl_surface_2.0_ash.png",
    thumbnail: "/visualiser/bathroom/thumbnails/surface_2_0_ash.png",
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
    wallImage: "/visualiser/bathroom/walls/wl_surface_2.0_cool_grey.png",
    floorImage: "/visualiser/bathroom/floors/fl_surface_2.0_cool_grey.png",
    thumbnail: "/visualiser/bathroom/thumbnails/surface_2_0_cool_grey.png",
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
    wallImage: "/visualiser/bathroom/walls/wl_surface_2.0_mid_grey.png",
    floorImage: "/visualiser/bathroom/floors/fl_surface_2.0_mid_grey.png",
    thumbnail: "/visualiser/bathroom/thumbnails/surface_2_0_mid_grey.png",
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
    wallImage: "/visualiser/bathroom/walls/wl_surface_2.0_off_white.png",
    floorImage: "/visualiser/bathroom/floors/fl_surface_2.0_off_white.png",
    thumbnail: "/visualiser/bathroom/thumbnails/surface_2_0_off_white.png",
    productUrl: "/products/surface-2-0-off-white-1200x1200",
  },
];



/* =====================================================
   DOM REFERENCES
===================================================== */

let wallImg: HTMLImageElement | null = null;
let floorImg: HTMLImageElement | null = null;
let listContainer: HTMLElement | null = null;
let searchInput: HTMLInputElement | null = null;
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

  searchInput = document.getElementById("bathroom-search") as HTMLInputElement;

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
          class="shrink-0 rounded-lg border ${
            tile.id === activeTileId ? "border-black" : "border-gray-300"
          }"
        >
          <img
            src="${tile.thumbnail}"
            alt="${tile.name}"
            class="w-20 h-20 object-cover rounded-lg"
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
        if (tile) applyTile(tile, index);
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
  if (!searchInput) return;

  searchInput.oninput = () => {
    const q = searchInput!.value.toLowerCase();

    const filtered = TILES.filter((t) =>
      `${t.name} ${t.colour.join(" ")} ${t.finishes.join(" ")}`
        .toLowerCase()
        .includes(q)
    );

    renderTileList(filtered);
  };
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
