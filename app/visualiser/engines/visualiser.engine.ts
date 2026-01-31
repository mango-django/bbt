"use client";

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";




type FloorTextureItem = {
  id: string;
  name: string;
  texture?: THREE.Texture; // lazy
  texturePath: string;
  thumbnail: string;
  productUrl: string;
};


type WorktopTextureItem = {
  id: string;
  name: string;
  texture: THREE.Texture | null; // ✅ NOT optional
  texturePath: string;
  thumbnail: string;
  productUrl: string;
};


type WallTextureItem = {
  id: string;
  name: string;
  texture?: THREE.Texture; // ✅ lazy-loaded
  texturePath: string;     // ✅ path only
  thumbnail: string;
  productUrl: string;
};

type Category =
  | "Floor"
  | "Worktop"
  | "Cupboards"
  | "Stools"
  | "Walls";

// -----------------------------
// 🔒 GLOBAL INIT GUARD (CRITICAL)
// -----------------------------
let VISUALISER_INITIALISED = false;
let animationId: number | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;



export function initVisualiser() {
  if (typeof window === "undefined") return;

  // 🚨 HARD GUARD: prevent double init (mobile-safe)
  if (VISUALISER_INITIALISED) {
    console.warn("⚠️ Visualiser already initialised — skipping");
    return;
  }
  VISUALISER_INITIALISED = true;


let actualProgress = 0;
let displayedProgress = 0;
let loadingComplete = false;
let loaderAnimationStarted = false;
let dotInterval: number | null = null;
let dotCount = 0;

function startFinalisingDots(): void {
  if (dotInterval !== null) return;

  const stageEl = document.getElementById(
    "visualiser-progress-stage"
  ) as HTMLDivElement | null;

  if (!stageEl) return;

  dotInterval = window.setInterval(() => {
    dotCount = (dotCount + 1) % 4; // 0 → 3
    const dots = ".".repeat(dotCount || 1);
    stageEl.textContent = `Finalising scene${dots}`;
  }, 450);
}

function stopFinalisingDots(): void {
  if (dotInterval !== null) {
    clearInterval(dotInterval);
    dotInterval = null;
    dotCount = 0;
  }
}


function updateStageText(progress: number): void {
  const stageEl = document.getElementById(
    "visualiser-progress-stage"
  ) as HTMLDivElement | null;

  if (!stageEl) return;

  if (progress < 55) {
    stopFinalisingDots();
    stageEl.textContent = "Loading textures…";
  } else if (progress < 85) {
    stopFinalisingDots();
    stageEl.textContent = "Preparing lighting…";
  } else if (progress < 100) {
  startFinalisingDots();
  // Safety: ensure base text exists immediately
  const stageEl = document.getElementById(
    "visualiser-progress-stage"
  ) as HTMLDivElement | null;

  if (stageEl && !stageEl.textContent?.includes("Finalising")) {
    stageEl.textContent = "Finalising scene.";
  }
  } else {
    stopFinalisingDots();
    stageEl.textContent = "Ready";
  }
}


function animateLoaderProgress(): void {
  if (!loaderAnimationStarted) return;

  if (displayedProgress < actualProgress) {
    displayedProgress += Math.max(
      0.25,
      (actualProgress - displayedProgress) * 0.08
    );
  }

  if (loadingComplete && displayedProgress < 100) {
    displayedProgress += 1.1;
  }

  displayedProgress = Math.min(100, displayedProgress);

  emitProgress(Math.round(displayedProgress));

  if (displayedProgress < 100) {
    requestAnimationFrame(animateLoaderProgress);
  } else {
    window.dispatchEvent(new Event("visualiser-loaded"));
  }
}

function emitProgress(progress: number): void {
  const textEl = document.getElementById(
    "visualiser-progress-text"
  ) as HTMLDivElement | null;

  if (textEl) {
    textEl.textContent = `${progress}%`;
  }

  const barEl = document.getElementById(
    "visualiser-progress-bar"
  ) as HTMLDivElement | null;

  if (barEl) {
    barEl.style.width = `${progress}%`;
  }

  updateStageText(progress);

  window.dispatchEvent(
    new CustomEvent<{ progress: number }>("visualiser-progress", {
      detail: { progress },
    })
  );
}

function fadeMaterialFromWhite(
  material: THREE.MeshStandardMaterial,
  texture: THREE.Texture,
  finalEnvIntensity: number,
  speed = 0.08
) {
  // Force white, unlit buffer
  material.map = texture;
  material.color.set(0xffffff);
  material.emissive.set(0xffffff);
  material.emissiveIntensity = 1;
  material.envMapIntensity = 0;
  material.needsUpdate = true;

  let t = 0;

  function step() {
    t += speed;

    // Fade emissive off
    material.emissiveIntensity = Math.max(1 - t, 0);
    material.needsUpdate = true;

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      // Restore PBR lighting
      material.emissive.set(0x000000);
      material.emissiveIntensity = 0;
      material.envMapIntensity = finalEnvIntensity;
      material.needsUpdate = true;
    }
  }

  step();
}

const manager = new THREE.LoadingManager();

manager.onStart = () => {
  actualProgress = 0;
  displayedProgress = 0;
  loadingComplete = false;

  loaderAnimationStarted = true;
  emitProgress(0); // 👈 ensures stage text appears immediately
  animateLoaderProgress();
};

manager.onProgress = (_url, itemsLoaded, itemsTotal) => {
  if (!itemsTotal) return;

  actualProgress = Math.min(
    Math.round((itemsLoaded / itemsTotal) * 100),
    97 // Prevents premature 100%
  );
};

manager.onLoad = () => {
  loadingComplete = true;
};

const WORKTOP_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.25,
  metalness: 0,
  envMapIntensity: 0.2,

  emissive: new THREE.Color(0x000000),
  emissiveIntensity: 0,
});

  const textureLoader = new THREE.TextureLoader(manager);

  function loadTexture(path: string) {
    const tex = textureLoader.load(path);
    tex.flipY = false;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const STATIC_TEXTURES = {
    walls: loadTexture("/textures/kitchen/static/Kitchen_Static_Walls.webp"),
    cupboards: loadTexture("/textures/kitchen/static/Kitchen_Cupboards.webp"),
    coffee: loadTexture("/textures/kitchen/static/Kitchen_Coffee.webp"),
    cooker: loadTexture("/textures/kitchen/static/Kitchen_Cooker.webp"),
    hob: loadTexture("/textures/kitchen/static/Kitchen_Hob.webp"),
    sink: loadTexture("/textures/kitchen/static/Kitchen_Sink.webp"),
    windowFrame: loadTexture("/textures/kitchen/static/Kitchen_WindowFrame.webp"),
  };


  const WHITE_TEXTURE = new THREE.DataTexture(
  new Uint8Array([255, 255, 255, 255]),
  1,
  1,
  THREE.RGBAFormat
);
WHITE_TEXTURE.needsUpdate = true;
WHITE_TEXTURE.colorSpace = THREE.SRGBColorSpace;
  // -----------------------------
  // Floor texture registry (LOCAL – Option A)
  // -----------------------------
  const floorTextures: FloorTextureItem[] = [
    {
    id: "floor-amani-marble-dark-grey-1200x1200",
    name: "Amani Marble Dark Grey",
    texturePath: "/textures/kitchen/floor/fl_amani_marble_dark_grey_1200x1200.webp",
    thumbnail:("/thumbnails/kitchen/floor/amani_marble_dark_grey_1200x1200.webp"),
    productUrl: "/products/amani-marble-dark-grey-1200x1200"
  },
  {
    id: "floor-amani-marble-light-grey-1200x1200",
    name: "Amani Marble Light Grey",
    texturePath: "/textures/kitchen/floor/fl_amani_marble_light_grey_1200x1200.webp",
    thumbnail:("/thumbnails/kitchen/floor/amani_marble_light_grey_1200x1200.webp"),
    productUrl: "/products/amani-marble-light-grey-1200x1200"
  },
  {
    id: "breccia-adige-grey-1200x1200",
    name: "Breccia Adige Grey",
    texturePath: "/textures/kitchen/floor/fl_breccia_adige_grey_1200x1200.webp",
    thumbnail:("/thumbnails/kitchen/floor/breccia_adige_1200x1200.webp"),
    productUrl:"/products/breccia-adige-grey-1200x1200"
  },
  {
    id: "floor-calacatta-africa-white-1200x1200",
    name: "Calacatta Africa White",
    texturePath: "/textures/kitchen/floor/fl_calacatta_africa_white_1200x1200.webp",
    thumbnail:("/thumbnails/kitchen/floor/calacatta_africa_white_1200x1200.webp"),
    productUrl: "/products/calacatta-africa-white-1200x1200"
  },
  {
    id: "floor-calacatta-gold-white-1200x1200",
    name: "Calacatta Gold White",
    texturePath: "/textures/kitchen/floor/fl_calacatta_gold_white_1200x1200.webp",
    thumbnail:("/thumbnails/kitchen/floor/calacatta_gold_white_1200x1200.webp"),
    productUrl: "/products/calacatta-gold-white-1200x1200"
  },
  {
    id: "floor-carmo-stone-anthracite-1200x1200",
    name: "Carmo Stone Anthracite",
    texturePath:"/textures/kitchen/floor/fl_carmo_stone_anthracite_1200x1200.webp",
    thumbnail:("/thumbnails/kitchen/floor/carmo_stone_anthracite_1200x1200.webp"),
    productUrl: "/products/carmo-stone-anthracite-1200x1200"
  },
  {
    id: "floor-carmo-stone-black-1200x1200",
    name: "Carmo Stone Black",
    texturePath:"/textures/kitchen/floor/fl_carmo_stone_black_1200x1200.webp",
    thumbnail:("/thumbnails/kitchen/floor/carmo_stone_black_1200x1200.webp"),
    productUrl: "/products/carmo-stone-black-1200x1200"
  },
  {
    id: "floor-carmo-stone-grey-1200x1200",
    name: "Carmo Stone Grey",
    texturePath:"/textures/kitchen/floor/fl_carmo_stone_grey_1200x1200.webp",
    thumbnail:("/thumbnails/kitchen/floor/carmo_stone_grey_1200x1200.webp"),
    productUrl: "/products/carmo-stone-grey-1200x1200"
  },
   {
    id: "floor-carmo-stone-ivory-1200x1200",
    name: "Carmo Stone Ivory",
    texturePath:"/textures/kitchen/floor/fl_carmo_stone_ivory_1200x1200.webp",
    thumbnail:("/thumbnails/kitchen/floor/carmo_stone_ivory_1200x1200.webp"),
    productUrl: "/products/carmo-stone-ivory-1200x1200"
  },
  {
    id: "floor-classic-cararrra-grey-1200x1200",
    name: "Classic Cararra Grey",
    texturePath:"/textures/kitchen/floor/fl_classic_cararra_grey_1200x1200.webp",
    thumbnail:("/thumbnails/kitchen/floor/classic_cararra_grey_1200x1200.webp"),
    productUrl: "/products/classic-cararra-grey-1200x1200"
  },
 {
    id: "floor-medicea-marble-1200x1200",
    name: "Medicea Marble",
    texturePath:"/textures/kitchen/floor/fl_medicea_marble_1200x1200.webp",
    thumbnail:("/thumbnails/kitchen/floor/medicea_marble_1200x1200.webp"),
    productUrl: "/products/medicea-marble-1200x1200"
  },
  {
    id: "floor-panda-marble-1200x1200",
    name: "Panda Marble",
    texturePath:"/textures/kitchen/floor/fl_panda_marble_1200x1200.webp",
    thumbnail:("/thumbnails/kitchen/floor/panda_marble_1200x1200.webp"),
    productUrl: "/products/panda-marble-1200x1200"
  },
  {
    id: "floor-surface-2.0-ash-1200x1200",
    name: "Surface 2.0 Ash",
    texturePath:"/textures/kitchen/floor/fl_surface_2.0_ash_1200x1200.webp",
    thumbnail: ("/thumbnails/kitchen/floor/surface_2.0_ash_1200x1200.webp"),
    productUrl: "/products/surface-2.0-ash-1200x1200"
  },
  {
    id: "floor-surface-2.0-mid-grey-1200x1200",
    name: "Surface 2.0 Mid Grey",
    texturePath:"/textures/kitchen/floor/fl_surface_2.0_mid_grey_1200x1200.webp",
    thumbnail:("/thumbnails/kitchen/floor/surface_2.0_mid_grey_1200x1200.webp"),
    productUrl: "/products/surface-2.0-mid-grey-1200x1200"
  },
  {
    id: "floor-surface-2.0-sand-1200x1200",
    name: "Surface 2.0 Sand",
    texturePath:"/textures/kitchen/floor/fl_surface_2.0_sand_1200x1200.webp",
    thumbnail: ("/thumbnails/kitchen/floor/surface_2.0_sand_1200x1200.webp"),
    productUrl: "/products/surface-2.0-sand-1200x1200"
  },
  {
    id: "floor-surface-2.0-cool-grey-1200x1200",
    name: "Surface 2.0 Cool Grey",
    texturePath:"/textures/kitchen/floor/fl_surface_2.0_cool_grey_1200x1200.webp",
    thumbnail: ("/thumbnails/kitchen/floor/surface_2.0_cool_grey_1200x1200.webp"),
    productUrl: "/products/surface-2.0-cool-grey-1200x1200"
  },
  {
    id: "floor-versilia-marble-1200x1200",
    name: "Versilia Marble",
    texturePath:"/textures/kitchen/floor/fl_versilia_marble_1200x1200.webp",
    thumbnail: ("/thumbnails/kitchen/floor/versilia_marble_1200x1200.webp"),
    productUrl: "/products/versilia-marble-1200x1200"
  }
];

  let activeFloorIndex = 0;
  

  //---- WORKTOP TEXTURES ---- //

 
  const worktopTextures: WorktopTextureItem[] = [
  {
    id: "amani-marble-dark-grey",
    name: "Amani Marble Dark Grey",
    texture: null,
    texturePath: "/textures/kitchen/worktop/wt_amani_marble_dark_grey.webp",
    thumbnail: "/thumbnails/kitchen/worktop/wt_amani_marble_dark_grey.webp",
    productUrl: "/products/#",
  },
  {
    id: "amani-marble-light-grey",
    name: "Amani Marble Light Grey",
    texture: null,
    texturePath: "/textures/kitchen/worktop/wt_amani_marble_light_grey.webp",
    thumbnail: "/thumbnails/kitchen/worktop/wt_amani_marble_light_grey.webp",
    productUrl: "/products/amani-marble-light-grey-worktop",
  },
  {
    id: "calacatta-gold-white-worktop",
    name: "Calacatta Gold White",
    texture: null,
    texturePath: "/textures/kitchen/worktop/wt_calacatta_gold_white.webp",
    thumbnail: "/thumbnails/kitchen/worktop/wt_calacatta_gold_white.webp",
    productUrl: "/products/#",
  },
  {
    id: "calacatta-africa-white-worktop",
    name: "Calacatta Africa White",
    texture: null,
    texturePath: "/textures/kitchen/worktop/wt_calacatta_africa_white.webp",
    thumbnail: "/thumbnails/kitchen/worktop/wt_calacatta_africa_white.webp",
    productUrl: "/products/#",
  },
  {
    id: "breccia-adige-grey-worktop",
    name: "Breccia Adige Grey",
    texture: null,
    texturePath: "/textures/kitchen/worktop/wt_breccia_adige_grey.webp",
    thumbnail: "/thumbnails/kitchen/worktop/wt_breccia_adige_grey.webp",
    productUrl: "/products/breccia-adige-grey-worktop",
  },
  {
    id: "medicea-marble-worktop",
    name: "Medicea Marble",
    texture: null,
    texturePath: "/textures/kitchen/worktop/wt_medicea_marble.webp",
    thumbnail: "/thumbnails/kitchen/worktop/wt_medicea_marble.webp",
    productUrl: "/products/medicea-marble-worktop",
  },
  {
  id: "classic-cararra-grey-worktop",
    name: "Classic Carrara Grey",
    texture: null,
    texturePath: "/textures/kitchen/worktop/wt_classic_carrara_grey.webp",
    thumbnail: "/thumbnails/kitchen/worktop/wt_classic_carrara_grey.webp",
    productUrl: "/products/#",
  },
  
  {
  id: "taj-mahal-worktop",
    name: "Taj Mahal",
    texture: null,
    texturePath: "/textures/kitchen/worktop/wt_taj_mahal.webp",
    thumbnail: "/thumbnails/kitchen/worktop/wt_taj_mahal.webp",
    productUrl: "/products/#",
  },
  {
  id: "versilia-marble-worktop",
    name: "Versilia Marble",
    texture: null,
    texturePath: "/textures/kitchen/worktop/wt_versilia_marble.webp",
    thumbnail: "/thumbnails/kitchen/worktop/wt_versilia_marble.webp",
    productUrl: "/products/#",
  },
  
];

let activeWorktopIndex = 0;

// ---- WALL TEXTURES ---- //



const wallTextures: WallTextureItem[] = [
  {
    id: "wall-amani_marble_dark_grey_600x1200",
    name: "Amani Marble Dark Grey",
    texturePath:"/textures/kitchen/walls/wl_amani_marble_dark_grey_600x1200.webp",
    thumbnail: "/textures/kitchen/walls/wl_amani_marble_dark_grey_600x1200.webp",
    productUrl: "/products/amani-marble-dark-grey-600x1200",
  },
  {
    id: "wall-amani_marble_light_grey_600x1200",
    name: "Amani Marble Light Grey",
    texturePath:"/textures/kitchen/walls/wl_amani_marble_light_grey_600x1200.webp",
    thumbnail: "/textures/kitchen/walls/wl_amani_marble_light_grey_600x1200.webp",
    productUrl: "/products/amani-marble-light-grey-600x1200",
  },
  {
    id: "wall-breccia_adige_grey_600x1200",
    name: "Breccia Adige Grey",
    texturePath:"/textures/kitchen/walls/wl_breccia_adige_grey_600x1200.webp",
    thumbnail: "/textures/kitchen/walls/wl_amani_marble_light_grey_600x1200.webp",
    productUrl: "/products/amani-marble-light-grey-600x1200",
  },
  {
    id: "wall-calacatta_africa_white_600x1200",
    name: "Calacatta Africa White",
    texturePath:"/textures/kitchen/walls/wl_calacatta_africa_white_600x1200.webp",
    thumbnail: "/textures/kitchen/walls/wl_calacatta_africa_white_600x1200.webp",
    productUrl: "/products/calacatta-africa-white-600x1200",
  },
  {
    id: "wall-calacatta_gold_white_600x1200",
    name: "Calacatta Gold White",
    texturePath:"/textures/kitchen/walls/wl_calacatta_africa_white_600x1200.webp",
    thumbnail: "/textures/kitchen/walls/wl_calacatta_africa_white_600x1200.webp",
    productUrl: "/products/calacatta-africa-white-600x1200",
  },
  {
    id: "wall-carmo-stone_anthracite_600x1200",
    name: "Carmo Stone Anthracite",
    texturePath:"/textures/kitchen/walls/wl_carmo_stone_anthracite_600x1200.webp",
    thumbnail: "/textures/kitchen/walls/wl_carmo_stone_anthracite_600x1200.webp",
    productUrl: "/products/carmo-stone-anthracite-600x1200",
  },
  {
    id: "wall-carmo-stone-grey-600x1200",
    name: "Carmo Stone Grey",
    texturePath:"/textures/kitchen/walls/wl_carmo_stone_grey_600x1200.webp",
    thumbnail: "/textures/kitchen/walls/wl_carmo_stone_grey_600x1200.webp",
    productUrl: "/products/carmo-stone-grey-600x1200",
  },
  {
    id: "wall-carmo-stone-ivory-600x1200",
    name: "Carmo Stone Ivory",
    texturePath:"/textures/kitchen/walls/wl_carmo_stone_ivory_600x1200.webp",
    thumbnail: "/textures/kitchen/walls/wl_carmo_stone_ivory_600x1200.webp",
    productUrl: "/products/carmo-stone-ivory-600x1200",
  },
  {
    id: "wall-classic-cararra-grey-600x1200",
    name: "Classic Cararra Grey",
    texturePath:"/textures/kitchen/walls/wl_classic_carrara_grey_600x1200.webp",
    thumbnail: "/textures/kitchen/walls/wl_classic_cararra_grey_600x1200.webp",
    productUrl: "/products/classic-cararra-grey-600x1200",
  },
  {
    id: "wall-medicea-marble-600x1200",
    name: "Medicea Marble",
    texturePath:"/textures/kitchen/walls/wl_medicea_marble_600x1200.webp",
    thumbnail: "/textures/kitchen/walls/wl_medicea_marble_600x1200.webp",
    productUrl: "/products/medicea-marble-600x1200",
  },
  {
    id: "wall-surface-2.0-ash-600x1200",
    name: "Surface 2.0 Ash",
    texturePath:"/textures/kitchen/walls/wl_surface_2.0_ash_600x1200.webp",
    thumbnail: "/textures/kitchen/walls/wl_surface_2.0_ash_600x1200.webp",
    productUrl: "/products/surface-2.0-ash-600x1200",
  },
  {
    id: "wall-surface-2.0-sand-600x1200",
    name: "Surface 2.0 Sand",
    texturePath:"/textures/kitchen/walls/wl_surface_2.0_sand_600x1200.webp",
    thumbnail: "/textures/kitchen/walls/wl_surface_2.0_ash_600x1200.webp",
    productUrl: "/products/surface-2.0-ash-600x1200",
  },
  {
    id: "wall-surface_xl_cool_grey_600x1200",
    name: "Surface XL Cool Grey",
    texturePath:"/textures/kitchen/walls/wl_surface_xl_cool_grey_600x1200.webp",
    thumbnail: "/textures/kitchen/walls/wl_surface_xl_cool_grey_600x1200.webp",
    productUrl: "/products/surface-2-0-cool-grey-600x1200",
  },
  {
    id: "wall-taj-mahal-600x1200",
    name: "Taj Mahal",
    texturePath:"/textures/kitchen/walls/wl_taj_mahal_600x1200.webp",
    thumbnail: "/textures/kitchen/walls/wl_taj_mahal_600x1200.webp",
    productUrl: "/products/taj-mahal-600x1200",
  },
  {
    id: "wall-versilia-marble-600x1200",
    name: "Versilia Marble",
    texturePath:"/textures/kitchen/walls/wl_versilia_marble_600x1200.webp",
    thumbnail: "/textures/kitchen/walls/wl_versilia_marble_600x1200.webp",
    productUrl: "/products/versilia-marble-600x1200",
  }
];
let wallMesh: THREE.Mesh | null = null;
let activeWallIndex = 0;


// ------ Cupboards ---- //

let cupboardMesh: THREE.Mesh | null = null;
  let cupboardColor = new THREE.Color("#ffffff"); // Default to pure white

  // UPDATED MATERIAL: Neutralized for color accuracy
  const CUPBOARD_BASE_MATERIAL = new THREE.MeshBasicMaterial({
    map: STATIC_TEXTURES.cupboards,
    color: new THREE.Color(0xffffff),
  });

  const scene = new THREE.Scene();
  
  // CAMERA setup
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 50);
  camera.position.set(0.0, 0.85, 3.6);

 const canvas = document.getElementById("kitchen-canvas") as HTMLCanvasElement | null;

if (!canvas) {
  console.error("❌ Visualiser canvas not found");
  VISUALISER_INITIALISED = false;
  return;
}

// Prevent re-binding renderer to same canvas
if ((canvas as any).__threeBound) {
  console.warn("⚠️ Canvas already bound to renderer");
  return;
}
(canvas as any).__threeBound = true;


  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // HDR SETUP
  const rgbLoader = new RGBELoader(manager);
  rgbLoader.load("/hdr/kitchen.hdr", (hdrTexture) => {
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdrTexture;
    scene.background = hdrTexture;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.55; // Slightly higher for a brighter scene
    
    camera.updateProjectionMatrix();
  });

  // LIGHTING: Pure White, balanced intensity
  const ambientLight = new THREE.AmbientLight(0xfff5e8, 0.6); // Warmed + reduced to limit blue tint
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);


  // -----------------------------
  // Controls
  // -----------------------------
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;

// Locked straight-on look
controls.minAzimuthAngle = -1.0;
controls.maxAzimuthAngle = 0.05;

controls.minPolarAngle = Math.PI / 2.05;
controls.maxPolarAngle = Math.PI / 2.15;

controls.minDistance = 3.6;
controls.maxDistance = 3.6;

controls.update();

  // -----------------------------
  // Floor mesh handling
  // -----------------------------
  // -----------------------------
  // 1. Declare Mesh Variables at the top level of initVisualiser
  // -----------------------------
  let floorMesh: THREE.Mesh | null = null;
  let worktopMesh: THREE.Mesh | null = null;
  

  // -----------------------------
  // 2. Texture Application Functions
  // -----------------------------

  function applyActiveFloorTexture() {
  if (!floorMesh) return;

  const item = floorTextures[activeFloorIndex];

  if (!item.texture) {
    item.texture = loadTexture(item.texturePath);
  }

  floorMesh.material = new THREE.MeshStandardMaterial({
    map: item.texture,
    roughness: 0.8,
    metalness: 0,
    envMapIntensity: 0.05,
    color: 0xffffff,
  });
}


 function applyActiveWorktopTexture() {
  if (!worktopMesh) return;

  const item = worktopTextures[activeWorktopIndex];

  // 1️⃣ FORCE PURE WHITE GAP (no HDR, no lighting)
  WORKTOP_MATERIAL.map = null;
  WORKTOP_MATERIAL.color.set(0xffffff);
  WORKTOP_MATERIAL.emissive.set(0xffffff);
  WORKTOP_MATERIAL.emissiveIntensity = 1;
  WORKTOP_MATERIAL.envMapIntensity = 0;
  WORKTOP_MATERIAL.needsUpdate = true;

  // 2️⃣ Ensure texture is loaded BEFORE fade
  if (!item.texture) {
    item.texture = loadTexture(item.texturePath);
  }

  let t = 0;
  const speed = 0.08;

  function fadeIn() {
    t += speed;

    // Apply texture immediately (no black frame)
    WORKTOP_MATERIAL.map = item.texture;

    // Fade emissive OFF (white → lit texture)
    WORKTOP_MATERIAL.emissiveIntensity = 1 - t;

    WORKTOP_MATERIAL.needsUpdate = true;

    if (t < 1) {
      requestAnimationFrame(fadeIn);
    } else {
      // 3️⃣ Restore physically-correct shading
      WORKTOP_MATERIAL.emissive.set(0x000000);
      WORKTOP_MATERIAL.emissiveIntensity = 0;
      WORKTOP_MATERIAL.envMapIntensity = 0.2;
      WORKTOP_MATERIAL.needsUpdate = true;
    }
  }

  fadeIn();
}




  function applyActiveWallTexture() {
  if (!wallMesh) return;

  const item = wallTextures[activeWallIndex];

  if (!item.texture) {
    item.texture = loadTexture(item.texturePath);
  }

  // 1️⃣ Start with WHITE, but transparent
  const material = new THREE.MeshStandardMaterial({
    map: item.texture,
    roughness: 0.5,
    metalness: 0,
    envMapIntensity: 0.1,
    color: 0xffffff,

    transparent: true,
    opacity: 0, // 👈 start invisible
  });

  wallMesh.material = material;
  material.needsUpdate = true;

  if (!wallMesh.geometry.attributes.uv) {
    console.warn("Wall mesh has no UVs:", wallMesh.name);
    return;
  }

  // 2️⃣ Fade IN (white → texture, lighting intact)
  let opacity = 1;
  const speed = 0.06;

  function fadeIn() {
    opacity += speed;
    material.opacity = Math.min(opacity, 1);
    material.needsUpdate = true;

    if (opacity < 1) {
      requestAnimationFrame(fadeIn);
    } else {
      // 3️⃣ Lock material after fade (performance)
      material.transparent = false;
      material.opacity = 1;
      material.needsUpdate = true;
    }
  }

  fadeIn();
}



  // -----------------------------
  // Static Mesh Loader
  // -----------------------------
function isStaticMesh(name: string) {
  return (
    name.includes("static_wall") ||
    name.includes("windowframe") ||
    name.includes("cupboard") ||
    name.includes("cabinet") ||
    name.includes("coffee") ||
    name.includes("cooker") ||
    name.includes("hob") ||
    name.includes("sink") ||
    name.includes("stools")
  );
}

function isOvenGlass(name: string) {
  return (
    name.includes("oven_glass") ||
    (name.includes("glass") && (name.includes("oven") || name.includes("cooker")))
  );
}


// -----------------------------
// GENERIC GLASS MATERIALS (LOCKED)
// -----------------------------
const GENERIC_GLASS_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transmission: 1,      // true glass
  opacity: 1,
  roughness: 0.05,
  metalness: 0,
  thickness: 0.01,
  ior: 1.45,
  clearcoat: 0.2,
  clearcoatRoughness: 0.1,
  transparent: true,
});

// -----------------------------
  // UPDATED GLASS MATERIALS
  // -----------------------------
  const WINDOW_GLASS_MATERIAL = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.95,   // High transmission for transparency
    opacity: 0.1,         // Low opacity for slight tint/reflection
    transparent: true,
    roughness: 0.05,
    metalness: 0,
    ior: 1.5,             // Index of refraction for glass
    thickness: 0.05,      // Gives volume to the glass
    specularIntensity: 1,
    envMapIntensity: 1.5, // Enhances reflections from the HDR
  });

  const OVEN_GLASS_MATERIAL = new THREE.MeshPhysicalMaterial({
    color: 0x222222,      // Darker tint for oven
    transmission: 0.7,
    opacity: 0.5,
    roughness: 0.1,
    transparent: true,
  });

function addGlassFromFrame(
  frameMesh: THREE.Mesh,
  depthOffset = 0.015
) {
  frameMesh.geometry.computeBoundingBox();

  const bbox = frameMesh.geometry.boundingBox;
  if (!bbox) return;

  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bbox.getSize(size);
  bbox.getCenter(center);

  // Glass size slightly smaller than frame
  const glassWidth = size.x * 0.96;
  const glassHeight = size.y * 0.96;

  const glassGeometry = new THREE.PlaneGeometry(
    glassWidth,
    glassHeight
  );

  const glass = new THREE.Mesh(
    glassGeometry,
    WINDOW_GLASS_MATERIAL
  );

  // Convert local → world
  glass.position.copy(center);
  glass.position.z -= depthOffset;

  frameMesh.localToWorld(glass.position);

  glass.renderOrder = 1;
  glass.name = "Auto_Glass";

  scene.add(glass);
}

 let windowFrameMesh: THREE.Mesh | null = null;

  // -----------------------------
  // GLTF Model loader (with Draco)
  // -----------------------------
 const gltfLoader = new GLTFLoader(manager);
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  gltfLoader.setDRACOLoader(dracoLoader);

  

  gltfLoader.load(
    "/models/bellos_kitchen_v16.glb",
    (gltf) => {
      const model = gltf.scene;
      model.traverse((child: any) => {
        if (!child.isMesh) return;
        const name = child.name.toLowerCase();

        // Assign materials...
        if (name.includes("cupboard") || name.includes("cabinet")) {
          cupboardMesh = child;
          child.material = CUPBOARD_BASE_MATERIAL;
        }


  // 🔒 STATIC BAKED MATERIALS (LOCKED)
  if (isOvenGlass(name)) {
    child.material = OVEN_GLASS_MATERIAL;
    child.renderOrder = 1;
    child.material.needsUpdate = true;
    return;
  }

if (isStaticMesh(name)) {

  // ---- WINDOW FRAME ----
  if (name.includes("windowframe")) {
    windowFrameMesh = child;

    child.material = new THREE.MeshStandardMaterial({
      map: STATIC_TEXTURES.windowFrame,
      roughness: 0.45,
      metalness: 0.0,
    });

    return;
  }

  // ---- STATIC WALLS ----
  if (name.includes("static_wall")) {
    child.material = new THREE.MeshBasicMaterial({
      map: STATIC_TEXTURES.walls,
      color: new THREE.Color(0xffffff),
    });
    return;
  }

  // ---- CUPBOARDS (BASE BAKE – colour still multiplies) ----
  if (name.includes("cupboard") || name.includes("cabinet")) {
    cupboardMesh = child;
    child.material = CUPBOARD_BASE_MATERIAL;
    return;
  }

  // ---- COFFEE MACHINE ----
  if (name.includes("coffee")) {
    child.material = new THREE.MeshStandardMaterial({
      map: STATIC_TEXTURES.coffee,
      roughness: 0.35,
      metalness: 0.15,
    });
    return;
  }

  // ---- COOKER ----
  if (name.includes("cooker")) {
    child.material = new THREE.MeshStandardMaterial({
      map: STATIC_TEXTURES.cooker,
      roughness: 0.4,
      metalness: 0.2,
    });
    return;
  }

  // ---- HOB ----
  if (name.includes("hob")) {
    child.material = new THREE.MeshStandardMaterial({
      map: STATIC_TEXTURES.hob,
      roughness: 0.15,
      metalness: 0.6,
    });
    return;
  }

  // ---- SINK ----
  if (name.includes("sink")) {
    child.material = new THREE.MeshStandardMaterial({
      map: STATIC_TEXTURES.sink,
      roughness: 0.2,
      metalness: 0.8,
    });
    return;
  }

  child.material.needsUpdate = true;
  return; // ⛔ NEVER overridden
}


  // ✅ CUPBOARDS
  if (name.includes("cupboard") || name.includes("cabinet")) {
    cupboardMesh = child;
    child.material = CUPBOARD_BASE_MATERIAL;
    return;
  }

  // ✅ FLOOR
  if (name.includes("floor")) {
    floorMesh = child;
    applyActiveFloorTexture();
    return;
  }

if (name.includes("worktop")) {
  worktopMesh = child;

  // ✅ THIS is the key line
  child.material = WORKTOP_MATERIAL;

  applyActiveWorktopTexture();
  return;
}



  // 🎨 CUSTOMISABLE WALL
  if (name.includes("wall")) {
    wallMesh = child;
    child.visible = true;
    applyActiveWallTexture();
    return;
  }
  

  // 🧱 DEFAULT (cupboards, stools, walls etc.)
  child.material = new THREE.MeshStandardMaterial({
    color: 0xe5e5e5,
    roughness: 0.6,
  });


  
});



      // Normalize model transform so it sits on the floor and is centered.
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      model.position.x -= center.x;
      model.position.z -= center.z;
      model.position.y -= box.min.y;

      controls.target.set(0, size.y * 0.45, 0.60);
      controls.update();
      model.updateMatrixWorld(true);
      scene.add(model);


      console.log("✅ Kitchen model loaded");
    },
    undefined,
    (err) => console.error("❌ Failed to load model", err)
  );


 // -----------------------------
// Inject category options into sidebar
// -----------------------------
const optionsContainer = document.getElementById("options-container");
const elementSelect = document.getElementById(
  "element-category-select"
) as HTMLSelectElement | null;

function setActiveOutline(
  container: HTMLElement,
  activeCard: HTMLElement | null
) {
  Array.from(container.children).forEach((el) => {
    (el as HTMLElement).style.outline = "none";
  });
  if (activeCard) {
    activeCard.style.outline = "2px solid #5c555b";
  }
}

function buildTextureCard(
  item: FloorTextureItem | WorktopTextureItem | WallTextureItem,
  label: Category,
  onSelect: () => void,
  isActive: boolean
) {
  const card = document.createElement("div");
  card.style.display = "flex";
  card.style.alignItems = "center";
  card.style.gap = "12px";
  card.style.padding = "10px";
  card.style.borderRadius = "12px";
  card.style.border = "1px solid #e5e7eb";
  card.style.cursor = "pointer";
  card.style.background = "#fff";

  const img = document.createElement("img");
  img.src = item.thumbnail;
  img.style.width = "56px";
  img.style.height = "56px";
  img.style.borderRadius = "8px";
  img.style.objectFit = "cover";

  const textWrap = document.createElement("div");
  textWrap.style.flex = "1";

  const title = document.createElement("div");
  title.textContent = item.name;
  title.style.fontSize = "14px";
  title.style.fontWeight = "600";
  title.style.color = "#374151";

  const subtitle = document.createElement("div");
  subtitle.textContent = label;
  subtitle.style.fontSize = "12px";
  subtitle.style.color = "#4b5563";

  textWrap.appendChild(title);
  textWrap.appendChild(subtitle);

  const arrow = document.createElement("button");
  arrow.innerHTML = "↗";
  arrow.style.border = "1px solid #d1d5db";
  arrow.style.borderRadius = "999px";
  arrow.style.width = "28px";
  arrow.style.height = "28px";
  arrow.style.cursor = "pointer";
  arrow.style.background = "#fff";

  arrow.onclick = (e) => {
    e.stopPropagation();
    window.open(item.productUrl, "_blank");
  };

  card.onclick = () => {
    onSelect();
    if (optionsContainer) {
      setActiveOutline(optionsContainer, card);
    }
  };

  if (isActive) {
    card.style.outline = "2px solid #5c555b";
  }

  card.appendChild(img);
  card.appendChild(textWrap);
  card.appendChild(arrow);

  return card;
}


function renderCategoryOptions(category: Category) {
  if (!optionsContainer) return;
  optionsContainer.innerHTML = "";

  // -----------------------------
  // CUPBOARDS (Color Picker UI)
  // -----------------------------
  if (category === "Cupboards") {
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.textAlign = "center";
    container.style.background = "#f9fafb";
    container.style.borderRadius = "12px";
    container.style.border = "1px solid #e5e7eb";

    const label = document.createElement("div");
    label.textContent = "Select Cupboard Colour";
    label.style.marginBottom = "15px";
    label.style.fontWeight = "600";
    label.style.fontSize = "14px";
    label.style.color = "#374151";

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    // Sync picker with current Three.js color state
    colorInput.value = "#" + cupboardColor.getHexString();
    colorInput.style.width = "100%";
    colorInput.style.height = "50px";
    colorInput.style.cursor = "pointer";
    colorInput.style.border = "none";
    colorInput.style.borderRadius = "8px";

    colorInput.oninput = (e) => {
      const hex = (e.target as HTMLInputElement).value;
      
      // 1. Update our color tracker
      cupboardColor.set(hex);

      // 2. Apply directly to material
      // We removed the 'brightness' check and multiplyScalar(1.15) 
      // This ensures #ffffff stays as pure white without color shifting.
      CUPBOARD_BASE_MATERIAL.color.copy(cupboardColor);

      // 3. Mark for update
      CUPBOARD_BASE_MATERIAL.needsUpdate = true;
    };

    container.appendChild(label);
    container.appendChild(colorInput);
    optionsContainer.appendChild(container);
    return;
  }

  // -----------------------------
  // FLOOR
  // -----------------------------
  if (category === "Floor") {
    floorTextures.forEach((item, index) => {
      const card = buildTextureCard(item, "Floor", () => {
        activeFloorIndex = index;
        applyActiveFloorTexture();
      }, index === activeFloorIndex);
      optionsContainer.appendChild(card);
    });
    return;
  }

  // -----------------------------
  // WORKTOP
  // -----------------------------
  if (category === "Worktop") {
    worktopTextures.forEach((item, index) => {
      const card = buildTextureCard(
        item,
        "Worktop",
        () => {
          activeWorktopIndex = index;
          applyActiveWorktopTexture();
        },
        index === activeWorktopIndex
      );
      optionsContainer.appendChild(card);
    });
    return;
  }

  // -----------------------------
  // WALLS (CUSTOMISABLE WALLS ONLY)
  // -----------------------------
  if (category === "Walls") {
    wallTextures.forEach((item, index) => {
      const card = buildTextureCard(
        item,
        "Walls",
        () => {
          activeWallIndex = index;
          applyActiveWallTexture();
        },
        index === activeWallIndex
      );
      optionsContainer.appendChild(card);
    });
    return;
  }

  // -----------------------------
  // FALLBACK
  // -----------------------------
  const placeholder = document.createElement("div");
  placeholder.textContent = "No textures available yet.";
  placeholder.style.fontSize = "13px";
  placeholder.style.color = "#4b5563";
  placeholder.style.padding = "6px 2px";
  optionsContainer.appendChild(placeholder);
}


if (!optionsContainer) {
  console.warn("No #options-container found for visualiser options");
} else {
  const initialCategory = (elementSelect?.value as Category) || "Floor";
  renderCategoryOptions(initialCategory);
}

if (elementSelect) {
  elementSelect.addEventListener("change", (event) => {
    const nextCategory = (event.target as HTMLSelectElement)
      .value as Category;
    renderCategoryOptions(nextCategory);
  });
}

window.addEventListener("visualiser-category-change", (event) => {
  const detail = (event as CustomEvent<{ category: Category }>).detail;
  if (!detail?.category) return;
  if (elementSelect) {
    elementSelect.value = detail.category;
  }
  renderCategoryOptions(detail.category);
});


  // -----------------------------
  // Resize + render loop
  // -----------------------------
  const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener("resize", handleResize);


let animationId: number;

function animate() {
  controls.update();
  renderer!.render(scene!, camera);
  animationId = requestAnimationFrame(animate);
}

animate();

}


export function destroyVisualiser() {
  if (!VISUALISER_INITIALISED) return;

  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  renderer?.dispose();
  scene?.clear();

  renderer = null;
  scene = null;

  VISUALISER_INITIALISED = false;

  console.warn("🧹 Visualiser destroyed");
}



