import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { appsById } from "../apps/registry";
import { emitEgg } from "./eggs/events";
import type { Size } from "./hooks";
import { Menu, type MenuItem } from "./Menu";
import { PixelIcon } from "./PixelIcon";
import { useWindows, type WinState } from "./windowStore";

interface WindowProps {
  win: WinState;
  isFront: boolean;
  /** Small screens: every window is full-screen and drag is off. */
  isMobile: boolean;
  desk: Size;
}

const KEY_STEP = 16;
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), Math.max(min, max));

export function Window({ win, isFront, isMobile, desk }: WindowProps) {
  const app = appsById[win.id];
  const wm = useWindows();
  const ref = useRef<HTMLElement>(null);
  const [moving, setMoving] = useState(false);
  const titleId = `win-title-${win.id}`;
  const maximized = win.maximized || isMobile;

  const w = Math.min(app.size.w, desk.w - 16);
  const h = Math.min(app.size.h, desk.h - 16);
  // Keep at least part of the title bar on screen so a window can always be grabbed.
  const clampX = (x: number) => clamp(x, -(w - 96), desk.w - 96);
  const clampY = (y: number) => clamp(y, 0, desk.h - 32);
  const x = clampX(win.x);
  const y = clampY(win.y);

  useEffect(() => {
    if (isFront && !win.minimized && ref.current && !ref.current.contains(document.activeElement)) {
      ref.current.focus({ preventScroll: true });
    }
  }, [isFront, win.minimized]);

  useEffect(() => {
    if (!isFront || maximized) setMoving(false);
  }, [isFront, maximized]);

  const startDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (maximized || e.button !== 0 || (e.target as HTMLElement).closest("button, [role=menu]")) return;
    const bar = e.currentTarget;
    bar.setPointerCapture(e.pointerId);
    const start = { px: e.clientX, py: e.clientY, x, y };
    // Easter egg: dragging a window onto the Trash icon.
    const trash = document.querySelector<HTMLElement>('.icon[data-app="trash"]');
    const overTrash = (ev: globalThis.PointerEvent) => {
      const r = trash?.getBoundingClientRect();
      return !!r && ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
    };
    const onMove = (ev: globalThis.PointerEvent) => {
      wm.move(win.id, clampX(start.x + ev.clientX - start.px), clampY(start.y + ev.clientY - start.py));
      trash?.toggleAttribute("data-drop", overTrash(ev));
    };
    const onUp = (ev: globalThis.PointerEvent) => {
      trash?.removeAttribute("data-drop");
      if (ev.type === "pointerup" && overTrash(ev)) {
        wm.move(win.id, start.x, start.y);
        emitEgg("trash-drop");
      }
      bar.removeEventListener("pointermove", onMove);
      bar.removeEventListener("pointerup", onUp);
      bar.removeEventListener("pointercancel", onUp);
    };
    bar.addEventListener("pointermove", onMove);
    bar.addEventListener("pointerup", onUp);
    bar.addEventListener("pointercancel", onUp);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (moving) {
      const step = e.shiftKey ? 4 : KEY_STEP;
      const delta: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const d = delta[e.key];
      if (d) wm.move(win.id, clampX(x + d[0]), clampY(y + d[1]));
      else if (e.key === "Enter" || e.key === "Escape") setMoving(false);
      else return;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.key === "Escape") {
      e.stopPropagation();
      wm.close(win.id);
    }
  };

  const menuItems: MenuItem[] = [
    ...(isMobile
      ? []
      : [
          { label: win.maximized ? "Restore" : "Maximize", onSelect: () => wm.toggleMax(win.id) },
          {
            label: "Move with keyboard",
            onSelect: () => {
              if (win.maximized) wm.toggleMax(win.id);
              setMoving(true);
              ref.current?.focus();
            },
          },
          { label: "Center", onSelect: () => wm.move(win.id, (desk.w - w) / 2, (desk.h - h) / 2) },
        ]),
    { label: "Minimize", onSelect: () => wm.minimize(win.id) },
    { label: "Close", onSelect: () => wm.close(win.id) },
  ];

  const AppComponent = app.component;
  const classes = ["win", isFront && "is-front", maximized && "is-max", moving && "is-moving"].filter(Boolean).join(" ");

  return (
    <section
      ref={ref}
      className={classes}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      hidden={win.minimized}
      style={maximized ? { zIndex: win.z } : { left: x, top: y, width: w, height: h, zIndex: win.z }}
      onPointerDown={() => wm.focus(win.id)}
      onKeyDown={onKeyDown}
    >
      <div
        className="win__bar"
        onPointerDown={startDrag}
        onDoubleClick={(e) => {
          if (!isMobile && !(e.target as HTMLElement).closest("button, [role=menu]")) wm.toggleMax(win.id);
        }}
      >
        <Menu label={`${app.title} window menu`} buttonClassName="win__sys" items={menuItems}>
          <PixelIcon name={app.icon} size={18} />
        </Menu>
        <span className="win__title" id={titleId}>
          {app.title}
        </span>
        <button type="button" className="bevel win__btn" aria-label={`Minimize ${app.title}`} onClick={() => wm.minimize(win.id)}>
          _
        </button>
        {!isMobile && (
          <button
            type="button"
            className="bevel win__btn"
            aria-label={win.maximized ? `Restore ${app.title}` : `Maximize ${app.title}`}
            onClick={() => wm.toggleMax(win.id)}
          >
            {win.maximized ? "=" : "□"}
          </button>
        )}
        <button type="button" className="bevel win__btn" aria-label={`Close ${app.title}`} onClick={() => wm.close(win.id)}>
          x
        </button>
      </div>
      {moving && <p className="win__hint">Arrow keys move · Shift for small steps · Enter to drop</p>}
      <span className="sr-only" role="status">
        {moving ? `Moving ${app.title}. Use the arrow keys, then press Enter.` : ""}
      </span>
      <div className="win__body">
        <AppComponent
          params={win.params}
          open={wm.open}
          setParams={(params) => wm.setParams(win.id, params)}
          close={() => wm.close(win.id)}
        />
      </div>
    </section>
  );
}
