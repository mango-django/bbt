"use client";

import { useEffect, useState } from "react";
import { initVisualiser, destroyVisualiser } from "../visualiser.engine";
import MobileVisualiserFallback from "../MobileVisualiserFallback";

type Category =
  | "Floor"
  | "Worktop"
  | "Cupboards"
  | "Stools"
  | "Walls";

export default function VisualiserPage() {
  /* -------------------------------------------------
     📱 MOBILE FALLBACK (CRITICAL – MUST BE FIRST)
  ------------------------------------------------- */
  const isMobile =
    typeof window !== "undefined" &&
    /Android|iPhone|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    return <MobileVisualiserFallback />;
  }

  /* -------------------------------------------------
     STATE
  ------------------------------------------------- */
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [stageText, setStageText] = useState("Loading textures…");
  const [dotCount, setDotCount] = useState(0);

  const [stage, setStage] = useState<
    "textures" | "lighting" | "finalising" | "ready"
  >("textures");

  // Sidebar toggle (desktop + iPad)
  const [drawerOpen, setDrawerOpen] = useState(true);

  /* -------------------------------------------------
     INIT VISUALISER (DESKTOP + iPAD ONLY)
  ------------------------------------------------- */
  useEffect(() => {
    initVisualiser();

    return () => {
      destroyVisualiser();
    };
  }, []);

  /* -------------------------------------------------
     PROGRESS LISTENER
  ------------------------------------------------- */
  useEffect(() => {
    function handleProgress(e: Event) {
      const detail = (e as CustomEvent<{ progress: number }>).detail;
      if (!detail) return;

      const progress = detail.progress;
      setLoadingProgress(progress);

      if (progress < 55 && stage !== "textures") {
        setStage("textures");
        setStageText("Loading textures");
        setDotCount(0);
      } else if (progress < 74 && stage !== "lighting") {
        setStage("lighting");
        setStageText("Preparing lighting");
        setDotCount(0);
      } else if (progress < 100 && stage !== "finalising") {
        setStage("finalising");
        setStageText("Finalising scene");
        setDotCount(1);
      } else if (progress >= 100 && stage !== "ready") {
        setStage("ready");
        setStageText("Ready");
        setIsLoading(false);
      }
    }

    const handleLoaded = () => setIsLoading(false);

    window.addEventListener("visualiser-progress", handleProgress);
    window.addEventListener("visualiser-loaded", handleLoaded);

    return () => {
      window.removeEventListener("visualiser-progress", handleProgress);
      window.removeEventListener("visualiser-loaded", handleLoaded);
    };
  }, [stage]);

  /* -------------------------------------------------
     FINALISING DOTS
  ------------------------------------------------- */
  useEffect(() => {
    if (stage !== "finalising") return;

    const interval = setInterval(() => {
      setDotCount((prev) => (prev === 3 ? 1 : prev + 1));
    }, 450);

    return () => clearInterval(interval);
  }, [stage]);

  /* -------------------------------------------------
     JSX
  ------------------------------------------------- */
  return (
    <div className="fixed inset-0 bg-[#f5f5f5] overflow-hidden">
      {/* ================= LOADER ================= */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="text-center w-[320px]">
            <div className="text-xs tracking-[0.3em] text-gray-400">LOADING</div>
            <div className="mt-2 text-4xl font-semibold text-gray-800">
              {loadingProgress}%
            </div>
            <div className="mt-3 text-sm text-gray-500 min-h-[18px]">
              {stageText}
              {stage === "finalising" && ".".repeat(dotCount)}
            </div>
          </div>
        </div>
      )}

      {/* ================= CANVAS ================= */}
      <canvas
        id="kitchen-canvas"
        className="absolute inset-0 w-full h-full z-0"
      />

      {/* ================= UI OVERLAY ================= */}
      <div className="relative z-20 flex h-full flex-col pointer-events-none">
        {/* ===== Top Bar ===== */}
        <div className="h-16 flex items-center justify-between px-4 border-b bg-[#f5f5f5] pointer-events-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen((open) => !open)}
              className="text-2xl leading-none text-gray-700"
              aria-label={drawerOpen ? "Close sidebar" : "Open sidebar"}
            >
              ☰
            </button>
          </div>

          <button
            onClick={() => history.back()}
            className="px-6 py-1 rounded-full bg-[#5c555b] text-white text-sm hover:bg-[#4e484d] transition-colors"
          >
            Return to Store
          </button>

          <div className="text-xl text-gray-500">⋮</div>
        </div>

        {/* ===== Body ===== */}
        <div className="flex flex-1 overflow-hidden">
          {/* ===== DESKTOP SIDEBAR ===== */}
          <aside
            className={`hidden md:flex w-[320px] border-r bg-white flex-col pointer-events-auto transition-transform duration-300 ${
              drawerOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar />
          </aside>

          <div className="flex-1" />
        </div>

        {/* ===== Bottom Bar ===== */}
        <div className="h-16 border-t bg-[#f9fafb] flex items-center justify-between px-6 text-sm pointer-events-auto">
          <div>
            Current selection:{" "}
            <span id="option-placeholder" className="font-semibold">
              -
            </span>
          </div>
          <div className="text-gray-500">
            Powered by <strong>Plan Vector</strong>
          </div>
        </div>
      </div>

      {/* Mobile drawer removed: visualiser not accessible on phones */}
    </div>
  );
}

/* ---------------------------------------
   SHARED SIDEBAR CONTENT
--------------------------------------- */
function Sidebar() {
  return (
    <>
      <div className="p-4 border-b">
        <input
          placeholder="Search tiles..."
          className="w-full px-4 py-2 text-sm rounded-full border outline-none text-neutral-700 placeholder:text-neutral-500"
        />
      </div>

      <div className="px-4 py-3 border-b">
        <select
          id="element-category-select"
          className="w-full px-3 py-2 text-sm rounded-md border bg-gray-50 text-neutral-700"
          onChange={(event) => {
            window.dispatchEvent(
              new CustomEvent("visualiser-category-change", {
                detail: { category: event.target.value },
              })
            );
          }}
        >
          <option>Floor</option>
          <option>Worktop</option>
          <option>Cupboards</option>
          <option>Walls</option>
        </select>
      </div>

      <div
        id="options-container"
        className="flex-1 overflow-y-auto p-4 space-y-3"
      />
    </>
  );
}
