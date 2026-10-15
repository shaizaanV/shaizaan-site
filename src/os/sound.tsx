import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

// Sound is off by default. The synthesized effects and music arrive with the Favorites app;
// for now this only holds the on/off state that the taskbar toggle controls.

interface SoundApi {
  on: boolean;
  toggle: () => void;
}

const SoundContext = createContext<SoundApi | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(false);
  const toggle = useCallback(() => setOn((v) => !v), []);
  const api = useMemo(() => ({ on, toggle }), [on, toggle]);
  return <SoundContext.Provider value={api}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundApi {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used inside <SoundProvider>");
  return ctx;
}
