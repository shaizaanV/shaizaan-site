import { CURSOR } from "./icons";

function cursorSvg(fill: string, ink: string): string {
  const rects = CURSOR.flatMap((row, y) =>
    [...row].map((ch, x) =>
      ch === "." ? "" : `<rect x='${x}' y='${y}' width='1' height='1' fill='${ch === "k" ? ink : fill}'/>`
    )
  ).join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='32' viewBox='0 0 12 16' shape-rendering='crispEdges'>${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 0`;
}

/**
 * Pixel arrow cursor; the "hand" variant is filled with the accent colour.
 * "belt" is the black-belt cursor from Hapkido mode.
 */
export function setCursor(variant: "default" | "belt" = "default"): void {
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue("--ink").trim() || "#1d2419";
  const accent = css.getPropertyValue("--accent").trim() || "#e86a92";
  const [fill, hand, outline] = variant === "belt" ? ["#1d1d1d", "#1d1d1d", "#ffffff"] : ["#ffffff", accent, ink];
  const root = document.documentElement.style;
  root.setProperty("--cursor", `${cursorSvg(fill, outline)}, default`);
  root.setProperty("--cursor-hand", `${cursorSvg(hand, outline)}, pointer`);
  root.setProperty("--cursor-grab", `${cursorSvg(hand, outline)}, grab`);
}

export const installCursor = () => setCursor("default");
