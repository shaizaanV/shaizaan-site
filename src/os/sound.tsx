import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { playSfx, playSong, stopMusic, unlock, type Sfx } from "./audio";
import { songs } from "./songs";

// Sound is off by default. Turning it on (a user gesture) unlocks Web Audio;
// turning it off also stops any music.

interface SoundApi {
  on: boolean;
  toggle: () => void;
  /** Plays only while sound is on. Stable across renders. */
  sfx: (name: Sfx) => void;
  /** Id of the song playing, or null. */
  song: string | null;
  /** Starts a song, turning sound on if needed (call from a click). */
  playSong: (id: string) => void;
  stopSong: () => void;
}

const SoundContext = createContext<SoundApi | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(false);
  const [song, setSong] = useState<string | null>(null);
  const onRef = useRef(on);
  onRef.current = on;

  const toggle = useCallback(() => {
    if (onRef.current) {
      stopMusic();
      setSong(null);
      setOn(false);
    } else {
      unlock();
      setOn(true);
      playSfx("on");
    }
  }, []);

  const sfx = useCallback((name: Sfx) => {
    if (onRef.current) playSfx(name);
  }, []);

  const startSong = useCallback((id: string) => {
    const found = songs.find((s) => s.id === id);
    if (!found) return;
    setOn(true);
    playSong(found);
    setSong(id);
  }, []);

  const stopSong = useCallback(() => {
    stopMusic();
    setSong(null);
  }, []);

  const api = useMemo(
    () => ({ on, toggle, sfx, song, playSong: startSong, stopSong }),
    [on, toggle, sfx, song, startSong, stopSong]
  );
  return <SoundContext.Provider value={api}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundApi {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used inside <SoundProvider>");
  return ctx;
}
