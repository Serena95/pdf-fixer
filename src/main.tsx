import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Versione dell'app: cambiala per forzare il reset su tutti i client
const APP_VERSION = "v4-2026-05-13";

(async () => {
  try {
    const stored = localStorage.getItem("app_version");
    if (stored !== APP_VERSION) {
      // Cancella tutte le cache vecchie
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      // Disinstalla tutti i service worker vecchi
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      localStorage.setItem("app_version", APP_VERSION);
      if (stored !== null) {
        // Era una versione vecchia: ricarica pulito
        window.location.reload();
        return;
      }
    }
  } catch {}

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        reg.update();
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller) {
              nw.postMessage("SKIP_WAITING");
            }
          });
        });
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });
      } catch {}
    });
  }
})();
