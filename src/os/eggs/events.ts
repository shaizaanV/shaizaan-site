import { useEffect, useRef } from "react";

// A tiny event bus so easter eggs can be triggered from anywhere (keyboard, terminal, drag).

export type Egg = "matcha" | "hapkido" | "trash-drop" | "feed";

const EVENT = "shaizintosh:egg";

export function emitEgg(egg: Egg): void {
  window.dispatchEvent(new CustomEvent<Egg>(EVENT, { detail: egg }));
}

export function useEgg(egg: Egg, handler: () => void): void {
  const latest = useRef(handler);
  latest.current = handler;
  useEffect(() => {
    const listener = (e: Event) => {
      if ((e as CustomEvent<Egg>).detail === egg) latest.current();
    };
    window.addEventListener(EVENT, listener);
    return () => window.removeEventListener(EVENT, listener);
  }, [egg]);
}
