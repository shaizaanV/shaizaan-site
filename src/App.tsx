import { useCallback, useEffect, useRef, useState } from "react";
import type { AppId } from "./apps/registry";
import { BootScreen } from "./os/BootScreen";
import { OS_NAME } from "./os/brand";
import { Desktop } from "./os/Desktop";
import { useElementSize, useMediaQuery } from "./os/hooks";
import { SocialsIsland } from "./os/SocialsIsland";
import { SoundProvider, useSound } from "./os/sound";
import { Taskbar } from "./os/Taskbar";
import { useHashRoute } from "./os/useHashRoute";
import { Window } from "./os/Window";
import { WindowProvider, useWindows } from "./os/windowStore";

const BOOTED_KEY = "shaizintosh.booted";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Boot once per browser session. Share links and reduced motion go straight to the desktop. */
function shouldBoot(): boolean {
  if (window.matchMedia(REDUCED_MOTION).matches || window.location.hash.length > 1) return false;
  try {
    return sessionStorage.getItem(BOOTED_KEY) !== "1";
  } catch {
    return true;
  }
}

function Shell() {
  const wm = useWindows();
  const { sfx } = useSound();
  const osRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLElement>(null);
  const desk = useElementSize(deskRef);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const reducedMotion = useMediaQuery(REDUCED_MOTION);
  const [selected, setSelected] = useState<AppId | null>(null);
  const [booting, setBooting] = useState(shouldBoot);
  useHashRoute();

  const finishBoot = useCallback(() => {
    try {
      sessionStorage.setItem(BOOTED_KEY, "1");
    } catch {
      // Private mode etc.: the boot just plays again next visit.
    }
    setBooting(false);
    sfx("boot");
  }, [sfx]);

  const restart = () => {
    wm.closeAll();
    wm.open("readme");
    if (!reducedMotion) setBooting(true);
  };

  // While booting, the desktop underneath can't be focused or clicked.
  useEffect(() => {
    const os = osRef.current;
    if (!os) return;
    os.toggleAttribute("inert", booting);
    if (!booting) os.querySelector<HTMLElement>(".win.is-front")?.focus({ preventScroll: true });
  }, [booting]);

  return (
    <>
      <div className="os" ref={osRef}>
        <main
          ref={deskRef}
          className="desk"
          aria-label={`${OS_NAME} desktop`}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <h1 className="sr-only">Shaizaan Valiyani: portfolio</h1>
          <Desktop selected={selected} onSelect={setSelected} />
          <SocialsIsland />
          {wm.windows.map((win) => (
            <Window key={win.id} win={win} isFront={wm.focused?.id === win.id} isMobile={isMobile} desk={desk} />
          ))}
        </main>
        <Taskbar onRestart={restart} />
      </div>
      {booting && <BootScreen onDone={finishBoot} />}
    </>
  );
}

export function App() {
  return (
    <SoundProvider>
      <WindowProvider>
        <Shell />
      </WindowProvider>
    </SoundProvider>
  );
}
