const WINDOW_COLORS = ["#ffd700", "#ffd700", "#ffd700", "#ffcf6b", "#7be8ff", "#ff8fd6"];

function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const value = parseInt(hex.replace("#", ""), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function mixColor(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

export function renderStars(container: HTMLElement, count = 90): void {
  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const star = document.createElement("span");
    star.className = "star";
    const size = Math.random() < 0.15 ? 2 : 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${randRange(0, 100).toFixed(2)}%`;
    star.style.top = `${randRange(0, 62).toFixed(2)}%`;
    star.style.animationDuration = `${randRange(2, 5).toFixed(2)}s`;
    star.style.animationDelay = `${randRange(0, 6).toFixed(2)}s`;
    if (Math.random() < 0.12) {
      star.style.background = pick(["#fff7d6", "#bfe9ff"]);
    }
    fragment.appendChild(star);
  }

  container.appendChild(fragment);
}

export function renderBuildings(container: HTMLElement): void {
  container.innerHTML = "";
  const viewportWidth = Math.max(window.innerWidth, 320);
  const skyBandPx = Math.max(window.innerHeight * 0.42, 160);
  const avgWidth = 58;
  const count = Math.ceil(viewportWidth / avgWidth) + 4;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const width = Math.round(randRange(40, 76));
    const heightFraction = randRange(0.22, 1);
    const heightPx = Math.round(heightFraction * skyBandPx);

    const building = document.createElement("div");
    building.className = "building";
    building.style.width = `${width}px`;
    building.style.height = `${heightPx}px`;
    building.style.setProperty("--building-top", mixColor("#241f3d", "#0c0916", heightFraction));
    building.style.setProperty("--building-bottom", mixColor("#120e22", "#050408", heightFraction));

    const cols = Math.min(5, Math.max(2, Math.floor(width / 13)));
    const rows = Math.min(12, Math.max(3, Math.floor((heightPx - 16) / 16)));

    const grid = document.createElement("div");
    grid.className = "building__windows";
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    const totalWindows = cols * rows;
    for (let w = 0; w < totalWindows; w++) {
      const win = document.createElement("span");
      win.className = "window";
      if (Math.random() < 0.6) {
        win.classList.add("is-lit");
        win.style.setProperty("--window-color", pick(WINDOW_COLORS));
        if (Math.random() < 0.35) {
          win.style.animation = `window-flicker ${randRange(4, 9).toFixed(1)}s ease-in-out ${randRange(
            0,
            6
          ).toFixed(1)}s infinite`;
        }
      }
      grid.appendChild(win);
    }

    building.appendChild(grid);
    fragment.appendChild(building);
  }

  container.appendChild(fragment);
}

export function initBackground(starsEl: HTMLElement, buildingsEl: HTMLElement): void {
  renderStars(starsEl);
  renderBuildings(buildingsEl);

  let resizeTimer: number | undefined;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => renderBuildings(buildingsEl), 250);
  });
}
