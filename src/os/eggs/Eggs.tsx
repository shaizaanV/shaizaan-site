import { useEffect, useRef, useState } from "react";
import { setCursor } from "../cursor";
import { useMediaQuery } from "../hooks";
import { PixelIcon } from "../PixelIcon";
import { useSound } from "../sound";
import { useWindows } from "../windowStore";
import { emitEgg, useEgg } from "./events";
import { Screensaver } from "./Screensaver";
import "./eggs.css";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const HAPKIDO_MS = 6000;
const MATCHA_MS = 3600;

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && !!target.closest("input, textarea, select, [contenteditable='true']");

/** All the hidden stuff. Mounted once, inside the shell. */
export function Eggs({ active }: { active: boolean }) {
  const { open } = useWindows();
  const { sfx } = useSound();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [toast, setToast] = useState<string | null>(null);
  const [matcha, setMatcha] = useState(false);
  const [error, setError] = useState(false);
  const toastTimer = useRef<number>();
  const hapkidoTimer = useRef<number>();
  const matchaTimer = useRef<number>();

  const showToast = (text: string, ms = 3500) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), ms);
  };

  useEffect(
    () => () => {
      [toastTimer, hapkidoTimer, matchaTimer].forEach((t) => window.clearTimeout(t.current));
      document.documentElement.classList.remove("hapkido");
    },
    []
  );

  // Konami code, typing "matcha", and the backtick terminal.
  useEffect(() => {
    if (!active) return;
    let sequence: string[] = [];
    let typed = "";
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      sequence = [...sequence, key].slice(-KONAMI.length);
      if (sequence.join() === KONAMI.join()) {
        sequence = [];
        emitEgg("hapkido");
      }
      if (e.key === "`") {
        e.preventDefault();
        open("terminal");
        return;
      }
      if (/^[a-z]$/.test(key)) {
        typed = (typed + key).slice(-6);
        if (typed === "matcha") {
          typed = "";
          emitEgg("matcha");
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, open]);

  useEgg("hapkido", () => {
    sfx("kiai");
    setCursor("belt");
    document.documentElement.classList.remove("hapkido");
    void document.documentElement.offsetWidth; // restart the window shake if it's already running
    document.documentElement.classList.add("hapkido");
    showToast("Hapkido mode: every window just got blocked and countered. Black belt cursor equipped.", HAPKIDO_MS);
    window.clearTimeout(hapkidoTimer.current);
    hapkidoTimer.current = window.setTimeout(() => {
      document.documentElement.classList.remove("hapkido");
      setCursor("default");
    }, HAPKIDO_MS);
  });

  useEgg("matcha", () => {
    sfx("on");
    showToast("Matcha break. Back in a sip.", MATCHA_MS);
    if (reduced) return;
    setMatcha(true);
    window.clearTimeout(matchaTimer.current);
    matchaTimer.current = window.setTimeout(() => setMatcha(false), MATCHA_MS);
  });

  useEgg("trash-drop", () => {
    sfx("lose");
    setError(true);
  });

  return (
    <>
      {matcha && <div className="matcha-pour" aria-hidden="true" />}
      <p className="egg-toast" role="status" hidden={!toast}>
        {toast}
      </p>
      {error && <CannotDelete onClose={() => setError(false)} />}
      <Screensaver enabled={active} />
    </>
  );
}

function CannotDelete({ onClose }: { onClose: () => void }) {
  const okRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<Element | null>(document.activeElement);

  useEffect(() => {
    okRef.current?.focus();
    const target = returnTo.current;
    return () => {
      if (target instanceof HTMLElement && target.isConnected) target.focus();
    };
  }, []);

  return (
    <div className="egg-modal" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="egg-dialog win is-front"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="egg-dialog-title"
        aria-describedby="egg-dialog-text"
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Tab") {
            e.preventDefault();
            if (e.key === "Escape") onClose();
          }
        }}
      >
        <div className="win__bar">
          <span className="win__title" id="egg-dialog-title">
            Error
          </span>
        </div>
        <div className="win__body egg-dialog__body">
          <PixelIcon name="bug" size={40} />
          <p id="egg-dialog-text">
            Cannot delete Shaizaan.
            <br />
            Still compiling.
          </p>
          <button ref={okRef} type="button" className="bevel primary" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
