import { useRef, useState, type KeyboardEvent } from "react";
import { apps, type AppId } from "../apps/registry";
import { PixelIcon } from "./PixelIcon";
import { useWindows } from "./windowStore";

const desktopApps = apps.filter((a) => a.desktop);

/**
 * Desktop icons. Mouse: click selects, double-click opens.
 * Touch and keyboard (Enter/Space): one action opens. Arrows move between icons.
 */
export function Desktop({ selected, onSelect }: { selected: AppId | null; onSelect: (id: AppId | null) => void }) {
  const { open } = useWindows();
  const [tabIndex, setTabIndex] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const pointerType = useRef("mouse");

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const last = desktopApps.length - 1;
    const next: Record<string, number> = {
      ArrowDown: tabIndex + 1,
      ArrowRight: tabIndex + 1,
      ArrowUp: tabIndex - 1,
      ArrowLeft: tabIndex - 1,
      Home: 0,
      End: last,
    };
    const target = next[e.key];
    if (target === undefined) return;
    e.preventDefault();
    const i = Math.min(Math.max(target, 0), last);
    setTabIndex(i);
    buttons.current[i]?.focus();
  };

  return (
    <ul className="icons" aria-label="Desktop" onKeyDown={onKeyDown}>
      {desktopApps.map((app, i) => (
        <li key={app.id}>
          <button
            ref={(el) => {
              buttons.current[i] = el;
            }}
            type="button"
            className="icon"
            tabIndex={i === tabIndex ? 0 : -1}
            data-selected={selected === app.id}
            onFocus={() => setTabIndex(i)}
            onPointerDown={(e) => {
              pointerType.current = e.pointerType;
            }}
            onClick={(e) => {
              onSelect(app.id);
              // detail 0 = keyboard activation, 2 = double-click.
              if (e.detail === 0 || e.detail >= 2 || pointerType.current !== "mouse") open(app.id);
            }}
          >
            <PixelIcon name={app.icon} size={48} />
            <span>{app.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
