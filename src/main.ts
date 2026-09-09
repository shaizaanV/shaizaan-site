import "./style.css";
import { dataBankLogs, inventory, jukeboxTracks } from "./data";
import { runTypewriter } from "./typewriter";
import { renderInventory } from "./inventory";
import { renderDataBank } from "./databank";
import { renderJukebox } from "./jukebox";

function requireEl<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return el;
}

function init(): void {
  const typewriterEl = requireEl<HTMLElement>("#typewriter");
  runTypewriter(typewriterEl, {
    text: "Hello, I am Shaizaan. Student, hobbyist programmer, and Hapkido martial artist.",
  });

  renderInventory(requireEl<HTMLElement>("#inventoryGrid"), inventory);

  renderDataBank(
    requireEl<HTMLElement>("#databankTabs"),
    requireEl<HTMLElement>("#databankPanels"),
    dataBankLogs
  );

  renderJukebox(
    {
      list: requireEl<HTMLElement>("#jukeboxList"),
      visualizer: requireEl<HTMLElement>("#visualizer"),
      skyline: requireEl<HTMLElement>(".skyline"),
    },
    jukeboxTracks
  );
}

document.addEventListener("DOMContentLoaded", init);
