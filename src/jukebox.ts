import type { Track } from "./data";

interface JukeboxRefs {
  list: HTMLElement;
  visualizer: HTMLElement;
  skyline: HTMLElement;
}

export function renderJukebox(refs: JukeboxRefs, tracks: Track[]): void {
  const { list, visualizer, skyline } = refs;
  list.innerHTML = "";

  let activeButton: HTMLButtonElement | null = null;

  for (const track of tracks) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "jukebox__track";
    button.setAttribute("aria-pressed", "false");
    button.textContent = track.title;

    button.addEventListener("click", () => {
      const isSameTrack = activeButton === button;

      if (activeButton) {
        activeButton.setAttribute("aria-pressed", "false");
      }

      if (isSameTrack) {
        activeButton = null;
        visualizer.classList.remove("is-playing");
        skyline.style.filter = "hue-rotate(0deg)";
        skyline.style.setProperty("--skyline-accent", "#6c4b9e");
        return;
      }

      button.setAttribute("aria-pressed", "true");
      activeButton = button;
      visualizer.classList.add("is-playing");
      skyline.style.filter = `hue-rotate(${track.hue}deg)`;
      skyline.style.setProperty("--skyline-accent", `hsl(${track.hue}, 70%, 62%)`);
    });

    list.appendChild(button);
  }
}
