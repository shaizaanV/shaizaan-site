import { useRef, useState } from "react";
import type { AppId } from "./apps/registry";
import { OS_NAME } from "./os/brand";
import { Desktop } from "./os/Desktop";
import { useElementSize, useMediaQuery } from "./os/hooks";
import { SoundProvider } from "./os/sound";
import { Taskbar } from "./os/Taskbar";
import { useHashRoute } from "./os/useHashRoute";
import { Window } from "./os/Window";
import { WindowProvider, useWindows } from "./os/windowStore";

function Shell() {
  const wm = useWindows();
  const deskRef = useRef<HTMLElement>(null);
  const desk = useElementSize(deskRef);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [selected, setSelected] = useState<AppId | null>(null);
  useHashRoute();

  return (
    <div className="os">
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
        {wm.windows.map((win) => (
          <Window key={win.id} win={win} isFront={wm.focused?.id === win.id} isMobile={isMobile} desk={desk} />
        ))}
      </main>
      <Taskbar />
    </div>
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
