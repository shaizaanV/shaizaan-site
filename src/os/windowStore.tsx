import { createContext, useCallback, useContext, useMemo, useReducer, useRef, type ReactNode } from "react";
import type { AppId } from "../apps/registry";

export interface WinState {
  id: AppId;
  /** App-specific route state, e.g. a project slug. Mirrored in the URL hash. */
  params: string;
  x: number;
  y: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
}

interface State {
  windows: WinState[];
  topZ: number;
}

type Action =
  | { type: "open"; id: AppId; params?: string }
  | { type: "close"; id: AppId }
  | { type: "focus"; id: AppId }
  | { type: "minimize"; id: AppId }
  | { type: "toggleMax"; id: AppId }
  | { type: "move"; id: AppId; x: number; y: number }
  | { type: "setParams"; id: AppId; params: string }
  | { type: "closeAll" };

function update(state: State, id: AppId, patch: (w: WinState) => Partial<WinState>): WinState[] {
  return state.windows.map((w) => (w.id === id ? { ...w, ...patch(w) } : w));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "open": {
      const z = state.topZ + 1;
      if (state.windows.some((w) => w.id === action.id)) {
        return {
          topZ: z,
          windows: update(state, action.id, (w) => ({ z, minimized: false, params: action.params ?? w.params })),
        };
      }
      // Cascade new windows so they never land exactly on top of each other.
      const step = state.windows.length % 6;
      const win: WinState = {
        id: action.id,
        params: action.params ?? "",
        x: 240 + step * 28,
        y: 24 + step * 28,
        z,
        minimized: false,
        maximized: false,
      };
      return { topZ: z, windows: [...state.windows, win] };
    }
    case "close":
      return { ...state, windows: state.windows.filter((w) => w.id !== action.id) };
    case "focus": {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target || target.z === state.topZ) return state;
      const z = state.topZ + 1;
      return { topZ: z, windows: update(state, action.id, () => ({ z })) };
    }
    case "minimize":
      return { ...state, windows: update(state, action.id, () => ({ minimized: true })) };
    case "toggleMax":
      return { ...state, windows: update(state, action.id, (w) => ({ maximized: !w.maximized })) };
    case "move":
      return { ...state, windows: update(state, action.id, () => ({ x: action.x, y: action.y })) };
    case "setParams":
      return { ...state, windows: update(state, action.id, () => ({ params: action.params })) };
    case "closeAll":
      return { ...state, windows: [] };
  }
}

interface WindowApi {
  windows: WinState[];
  /** Topmost window that isn't minimized. */
  focused: WinState | undefined;
  open: (id: AppId, params?: string) => void;
  close: (id: AppId) => void;
  focus: (id: AppId) => void;
  minimize: (id: AppId) => void;
  toggleMax: (id: AppId) => void;
  move: (id: AppId, x: number, y: number) => void;
  setParams: (id: AppId, params: string) => void;
  closeAll: () => void;
}

const WindowContext = createContext<WindowApi | null>(null);

export function WindowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { windows: [], topZ: 0 });
  // Whatever had focus when a window opened gets it back when that window closes.
  const openers = useRef(new Map<AppId, HTMLElement>());

  const open = useCallback((id: AppId, params?: string) => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body) openers.current.set(id, active);
    dispatch({ type: "open", id, params });
  }, []);

  const close = useCallback((id: AppId) => {
    dispatch({ type: "close", id });
    const opener = openers.current.get(id);
    openers.current.delete(id);
    requestAnimationFrame(() => {
      if (opener?.isConnected) opener.focus();
    });
  }, []);

  const api = useMemo<WindowApi>(() => {
    const visible = state.windows.filter((w) => !w.minimized);
    const focused = visible.reduce<WinState | undefined>((top, w) => (!top || w.z > top.z ? w : top), undefined);
    return {
      windows: state.windows,
      focused,
      open,
      close,
      focus: (id) => dispatch({ type: "focus", id }),
      minimize: (id) => dispatch({ type: "minimize", id }),
      toggleMax: (id) => dispatch({ type: "toggleMax", id }),
      move: (id, x, y) => dispatch({ type: "move", id, x, y }),
      setParams: (id, params) => dispatch({ type: "setParams", id, params }),
      closeAll: () => dispatch({ type: "closeAll" }),
    };
  }, [state, open, close]);

  return <WindowContext.Provider value={api}>{children}</WindowContext.Provider>;
}

export function useWindows(): WindowApi {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error("useWindows must be used inside <WindowProvider>");
  return ctx;
}
