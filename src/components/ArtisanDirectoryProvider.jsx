import { useEffect, useMemo, useState } from "react";
import { PRODUCTS } from "../data/products";
import { buildArtisanDirectory } from "../data/heritage";
import { ArtisanDirectoryContext as DirectoryContext } from "../hooks/useArtisanDirectory";
export function ArtisanDirectoryProvider({ children }) {
  const [registered, setRegistered] = useState([]);
  const [status, setStatus] = useState("loading");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let inFlight = false;
    async function refresh() {
      if (inFlight) return;
      inFlight = true;
      try {
        const response = await fetch("/api/artisans", {
          signal: controller.signal,
        });
        if (!response.ok) throw Error("Directory unavailable");
        const data = await response.json();
        if (!Array.isArray(data.artisans)) throw Error("Invalid directory");
        setRegistered(data.artisans);
        setStatus("ready");
      } catch (error) {
        if (error.name !== "AbortError") setStatus("error");
      } finally {
        inFlight = false;
      }
    }
    refresh();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [revision]);
  const artisans = useMemo(
    () => buildArtisanDirectory(PRODUCTS, registered),
    [registered],
  );
  return (
    <DirectoryContext.Provider
      value={{ artisans, status, refresh: () => setRevision((n) => n + 1) }}
    >
      {children}
    </DirectoryContext.Provider>
  );
}
