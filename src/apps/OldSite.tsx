import { useEffect, useRef } from "react";
import { OS_NAME } from "../os/brand";
import { useMediaQuery } from "../os/hooks";
import type { AppProps } from "./registry";
import "./oldSite.css";

// The retired cyberpunk skyline from v1 of shaizaan.com, redrawn on a canvas.

function seeded(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
}

interface Star {
  x: number;
  y: number;
  size: number;
  phase: number;
}

function drawSkyline(canvas: HTMLCanvasElement, t: number, stars: Star[]): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#060608");
  sky.addColorStop(0.55, "#17142b");
  sky.addColorStop(1, "#2c1f4a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  for (const s of stars) {
    ctx.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(t / 900 + s.phase));
    ctx.fillStyle = "#fff7d6";
    ctx.fillRect(s.x * w, s.y * h, s.size, s.size);
  }
  ctx.globalAlpha = 1;

  // moon
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.2, h * 0.07, 0, Math.PI * 2);
  ctx.fill();

  // buildings with lit windows (same layout every frame)
  const rand = seeded(42);
  const px = Math.max(2, Math.round(w / 320));
  let x = 0;
  while (x < w) {
    const bw = Math.round((40 + rand() * 36) * px * 0.5);
    const bh = Math.round(h * (0.25 + rand() * 0.45));
    ctx.fillStyle = "#100d20";
    ctx.fillRect(x, h - bh, bw - px, bh);
    for (let wy = h - bh + 4 * px; wy < h - 4 * px; wy += 5 * px) {
      for (let wx = x + 3 * px; wx < x + bw - 4 * px; wx += 5 * px) {
        if (rand() < 0.35) {
          ctx.fillStyle = rand() < 0.85 ? "#ffd700" : "#7be8ff";
          ctx.fillRect(wx, wy, 2 * px, 2 * px);
        }
      }
    }
    x += bw;
  }

  // neon grid floor line
  ctx.fillStyle = "#6c4b9e";
  ctx.fillRect(0, h - px, w, px);
}

export function OldSite(_props: AppProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rand = seeded(7);
    const stars: Star[] = Array.from({ length: 90 }, () => ({
      x: rand(),
      y: rand() * 0.6,
      size: rand() < 0.15 ? 2 : 1,
      phase: rand() * Math.PI * 2,
    }));
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      drawSkyline(canvas, performance.now(), stars);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    let frame = 0;
    let last = 0;
    const loop = (t: number) => {
      if (t - last > 120) {
        drawSkyline(canvas, t, stars);
        last = t;
      }
      frame = requestAnimationFrame(loop);
    };
    if (!reduced) frame = requestAnimationFrame(loop);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <div className="oldsite">
      <div className="oldsite__screen">
        <canvas
          ref={canvasRef}
          className="oldsite__canvas"
          role="img"
          aria-label="The old site's night skyline: a purple sky full of stars, a yellow moon, and dark buildings with glowing windows."
        />
        <div className="oldsite__overlay" aria-hidden="true">
          <p className="oldsite__title">SHAIZAAN.COM</p>
          <p className="oldsite__status">SYSTEM: ARCHIVED // v1</p>
        </div>
      </div>
      <p>
        This is where shaizaan.com used to live: a neon cyberpunk arcade with a typewriter bio, a jukebox that recolored
        the sky, and a skyline that never slept. Retired for {OS_NAME}, but never deleted.
      </p>
    </div>
  );
}
