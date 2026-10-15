import { useEffect, useRef, useState } from "react";
import { appsById, type AppId } from "../apps/registry";
import { useWindows } from "./windowStore";

interface Route {
  id: AppId;
  params: string;
}

/** "#projects/plant-o-matic" -> { id: "projects", params: "plant-o-matic" } */
function parseHash(hash: string): Route | null {
  const [id = "", ...rest] = decodeURIComponent(hash.replace(/^#/, "")).split("/");
  if (!(id in appsById)) return null;
  return { id: id as AppId, params: rest.join("/") };
}

/**
 * Share links open the full desktop with that window on top of the README.
 * The hash then follows whichever window is in front.
 */
export function useHashRoute(): void {
  const { open, focused } = useWindows();
  // Read the share link once, before the effect below starts rewriting the hash.
  const [initial] = useState(() => parseHash(window.location.hash));
  // StrictMode runs effects twice in dev; opening twice would put the README back on top.
  const booted = useRef(false);

  useEffect(() => {
    if (!booted.current) {
      booted.current = true;
      open("readme");
      if (initial) open(initial.id, initial.params);
    }
    const onHashChange = () => {
      const route = parseHash(window.location.hash);
      if (route) open(route.id, route.params);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [open, initial]);

  useEffect(() => {
    const hash = focused ? `#${focused.id}${focused.params ? `/${focused.params}` : ""}` : "";
    if (window.location.hash === hash) return;
    history.replaceState(null, "", hash || window.location.pathname + window.location.search);
  }, [focused?.id, focused?.params]);
}
