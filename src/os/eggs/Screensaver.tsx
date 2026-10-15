import { useEffect, useRef, useState } from "react";
import { OS_NAME } from "../brand";
import { useMediaQuery } from "../hooks";
import { ICONS, type IconName } from "../icons";

const IDLE_MS = 60_000;
const SPRITES: IconName[] = ["samosa", "chicken", "samosa", "chickenStep", "heart"];

/** Draws a pixel icon to an offscreen canvas, resolving theme colours from CSS. */
function rasterize(name: IconName, scale: number): HTMLCanvasElement {
  const css = getComputedStyle(document.documentElement);
  const color = (v: string, fallback: string) => css.getPropertyValue(v).trim() || fallback;
  const fills: Record<string, string> = {
    k: color("--ink", "#1d2419"),
    a: color("--accent", "#e86a92"),
    w: color("--paper", "#ffffff"),
    c: color("--chrome", "#dcdcd2"),
    t: color("--title", "#3f6b3a"),
    o: "#e39b2d",
  };
  const grid = ICONS[name];
  const canvas = document.createElement("canvas");
  canvas.width = grid[0]!.length * scale;
  canvas.height = grid.length * scale;
  const ctx = canvas.getContext("2d")!;
  grid.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === "." || !fills[ch]) return;
      ctx.fillStyle = fills[ch]!;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    })
  );
  return canvas;
}

interface Flyer {
  sprite: HTMLCanvasElement;
  x: number;
  y: number;
  speed: number;
  bob: number;
  phase: number;
}

/** After a minute of no input: samosas and chickens fly across the screen. Any input wakes it. */
export function Screensaver({ enabled }: { enabled: boolean }) {
  const [on, setOn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Idle detection.
  useEffect(() => {
    if (!enabled) return;
    let timer = 0;
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        // Don't interrupt a video someone is watching, or a hidden tab.
        if (document.hidden || document.activeElement?.tagName === "IFRAME") return arm();
        setOn(true);
      }, IDLE_MS);
    };
    const wake = () => {
      setOn(false);
      arm();
    };
    const events = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    arm();
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, wake));
    };
  }, [enabled]);

  // Animation.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!on || !canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.imageSmoothingEnabled = false;
    const sprites = SPRITES.map((name) => rasterize(name, Math.round(5 * dpr)));
    const w = canvas.width;
    const h = canvas.height;
    const flyers: Flyer[] = Array.from({ length: 14 }, (_, i) => ({
      sprite: sprites[i % sprites.length]!,
      x: Math.random() * w,
      y: Math.random() * (h - 80 * dpr),
      speed: (0.6 + Math.random() * 1.6) * dpr,
      bob: (8 + Math.random() * 20) * dpr,
      phase: Math.random() * Math.PI * 2,
    }));
    let frame = 0;
    const draw = (t: number) => {
      ctx.fillStyle = "#142412";
      ctx.fillRect(0, 0, w, h);
      for (const f of flyers) {
        if (!reduced) {
          f.x += f.speed;
          if (f.x > w) {
            f.x = -f.sprite.width;
            f.y = Math.random() * (h - 80 * dpr);
          }
        }
        const y = reduced ? f.y : f.y + Math.sin(t / 600 + f.phase) * f.bob;
        ctx.drawImage(f.sprite, Math.round(f.x), Math.round(y));
      }
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [on, reduced]);

  if (!on) return null;
  return (
    <div className="screensaver" aria-hidden="true">
      <canvas ref={canvasRef} className="screensaver__canvas" />
      <p className="screensaver__hint">{OS_NAME} is napping. Move the mouse or press a key.</p>
    </div>
  );
}
