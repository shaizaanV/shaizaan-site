import { useEffect, useMemo, useRef, useState } from "react";
import { OS_NAME } from "./brand";
import { PixelIcon } from "./PixelIcon";

const NAME_MS = 1000; // the name flashes on its own for this long
const SEGMENTS = 20;
const SEGMENT_MS = 70;
const HOLD_MS = 250; // full bar stays up briefly before the desktop appears
const FADE_MS = 200;

// One joke per boot, rotating, so a Restart shows something new.
const JOKES = [
  "Brewing tiramisu_matcha.sys",
  "Calibrating Hapkido reflexes",
  "Reading One Piece chapter 1,000-something",
  "Feeding the desk chicken",
  "Reheating samosas",
  "Compiling C++ (this may take a while)",
  "Defragmenting Minecraft world",
  "Becoming 10x More Preformative",
];
const BOOT_COUNT_KEY = "shaizintosh.bootCount";

function nextJoke(): string {
  let count = 0;
  try {
    count = Number(localStorage.getItem(BOOT_COUNT_KEY)) || 0;
    localStorage.setItem(BOOT_COUNT_KEY, String(count + 1));
  } catch {
    count = Math.floor(Math.random() * JOKES.length);
  }
  return JOKES[count % JOKES.length]!;
}

/** Name flashes for a second, then the progress bar fills. Any key or tap skips. */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const [showBar, setShowBar] = useState(false);
  const [filled, setFilled] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const lines = useMemo(() => ["Loading projects.dll…", `${nextJoke()}…`, "Mounting /youtube…", "Ready."], []);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const skip = () => done.current();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    const t = window.setTimeout(() => setShowBar(true), NAME_MS);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!showBar) return;
    if (filled < SEGMENTS) {
      const t = window.setTimeout(() => setFilled((n) => n + 1), SEGMENT_MS);
      return () => window.clearTimeout(t);
    }
    const t1 = window.setTimeout(() => setLeaving(true), HOLD_MS);
    const t2 = window.setTimeout(() => done.current(), HOLD_MS + FADE_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [showBar, filled]);

  const line = lines[Math.min(Math.floor((filled / SEGMENTS) * lines.length), lines.length - 1)];

  return (
    <div className={`boot${leaving ? " is-leaving" : ""}`} role="status" aria-label={`${OS_NAME} is starting`}>
      <div className="boot__inner">
        <span className="boot__logo">
          <PixelIcon name="logo" size={72} />
        </span>
        <p className="boot__name">{OS_NAME}</p>
        <div className={`boot__progress${showBar ? "" : " is-waiting"}`}>
          <div className="boot__bar" aria-hidden="true">
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <i key={i} className={i < filled ? "on" : undefined} />
            ))}
          </div>
          <p className="boot__line">{line}</p>
        </div>
      </div>
      <p className="boot__skip">Press any key or tap to skip</p>
    </div>
  );
}
