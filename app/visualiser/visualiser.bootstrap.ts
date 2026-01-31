import { initVisualiser } from "./engines/visualiser.engine";

let started = false;

export function bootstrapVisualiser() {
  if (started) return;
  started = true;

  if (typeof window === "undefined") return;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initVisualiser();
      forceOpenVisualiser();
    });
  } else {
    initVisualiser();
    forceOpenVisualiser();
  }
}

function forceOpenVisualiser() {
  // If we're on /visualiser/*, auto-open without homepage button
  if (window.location.pathname.startsWith("/visualiser")) {
    const overlay = document.getElementById("kitchen-overlay");
    if (overlay) {
      overlay.style.display = "flex";
    }
  }
}
