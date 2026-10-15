import { ICONS, type IconName } from "./icons";

const FILL: Record<string, string> = {
  k: "var(--ink)",
  a: "var(--accent)",
  w: "var(--paper)",
  c: "var(--chrome)",
  t: "var(--title)",
  o: "#e39b2d",
};

interface Run {
  x: number;
  y: number;
  w: number;
  c: string;
}

// Merge horizontal runs of the same colour so each icon is a handful of rects.
function toRuns(grid: string[]): Run[] {
  const runs: Run[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x] as string;
      let end = x + 1;
      while (row[end] === c) end += 1;
      if (c !== ".") runs.push({ x, y, w: end - x, c });
      x = end;
    }
  });
  return runs;
}

const cache = new Map<IconName, Run[]>();

export function PixelIcon({ name, size = 48 }: { name: IconName; size?: number }) {
  const grid = ICONS[name];
  let runs = cache.get(name);
  if (!runs) {
    runs = toRuns(grid);
    cache.set(name, runs);
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${grid[0]!.length} ${grid.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {runs.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} style={{ fill: FILL[r.c] }} />
      ))}
    </svg>
  );
}
