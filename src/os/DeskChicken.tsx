import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "./hooks";
import { PixelIcon } from "./PixelIcon";
import { useSound } from "./sound";
import "./deskChicken.css";

const SIZE = 48;
const WANDER_SPEED = 50; // px per second
const CHASE_SPEED = 110;
const SNACK_SPEED = 150;

type Mode = "idle" | "walk" | "peck";

/**
 * A pixel chicken that lives along the bottom of the desktop. It wanders, chases the mouse
 * when it's near the bottom, and eats the samosa you drop by clicking it.
 */
export function DeskChicken({ deskWidth }: { deskWidth: number }) {
  const { sfx } = useSound();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [x, setX] = useState(120);
  const [duration, setDuration] = useState(0);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [mode, setMode] = useState<Mode>("idle");
  const [samosa, setSamosa] = useState<number | null>(null);
  const [bubble, setBubble] = useState<string | null>(null);
  const [hearts, setHearts] = useState<number[]>([]);
  const [eaten, setEaten] = useState(0);
  const ref = useRef<HTMLButtonElement>(null);

  // The brain runs on timers and reads these refs, so it never sees stale state.
  const pos = useRef(120);
  const snack = useRef<number | null>(null);
  const width = useRef(deskWidth);
  const reducedRef = useRef(reduced);
  const pointer = useRef<{ x: number; at: number } | null>(null);
  const wake = useRef<() => void>(() => {});
  const sideTimers = useRef<number[]>([]);
  width.current = deskWidth;
  reducedRef.current = reduced;

  const later = (ms: number, fn: () => void) => {
    sideTimers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => {
    let alive = true;
    let timer: number | undefined;
    const schedule = (ms: number, fn: () => void) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => alive && fn(), ms);
    };
    const maxX = () => Math.max(8, width.current - SIZE - 8);

    const walkTo = (target: number, speed: number, then: () => void) => {
      const to = Math.min(Math.max(target, 8), maxX());
      const dist = Math.abs(to - pos.current);
      if (to !== pos.current) setFacing(to > pos.current ? 1 : -1);
      pos.current = to;
      if (dist < 4 || reducedRef.current) {
        setDuration(0);
        setX(to);
        then();
        return;
      }
      const ms = (dist / speed) * 1000;
      setDuration(ms);
      setX(to);
      setMode("walk");
      schedule(ms, () => {
        setMode("idle");
        then();
      });
    };

    const rest = () => schedule(1500 + Math.random() * 2500, think);

    const eat = () => {
      setMode("peck");
      schedule(600, () => {
        snack.current = null;
        setSamosa(null);
        setMode("idle");
        sfx("chomp");
        setEaten((n) => n + 1);
        const id = Date.now();
        setHearts((h) => [...h, id]);
        window.setTimeout(() => setHearts((h) => h.filter((k) => k !== id)), 900);
        rest();
      });
    };

    function think() {
      if (snack.current !== null) return walkTo(snack.current, SNACK_SPEED, eat);
      const p = pointer.current;
      if (p && Date.now() - p.at < 2500 && !reducedRef.current) return walkTo(p.x - SIZE / 2, CHASE_SPEED, rest);
      if (Math.random() < 0.3 || reducedRef.current) {
        setMode("peck");
        return schedule(700, () => {
          setMode("idle");
          rest();
        });
      }
      walkTo(Math.random() * maxX(), WANDER_SPEED, rest);
    }

    wake.current = () => {
      setMode("idle");
      think();
    };
    rest();
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [sfx]);

  // Chase the mouse when it's in the bottom part of the desktop.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const deskEl = ref.current?.offsetParent;
      if (!deskEl) return;
      const r = deskEl.getBoundingClientRect();
      const inBottom = e.clientY > r.bottom - 160 && e.clientY < r.bottom && e.clientX > r.left && e.clientX < r.right;
      if (inBottom) pointer.current = { x: e.clientX - r.left, at: Date.now() };
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => () => sideTimers.current.forEach((t) => window.clearTimeout(t)), []);

  const say = (text: string, ms = 1400) => {
    setBubble(text);
    later(ms, () => setBubble((b) => (b === text ? null : b)));
  };

  const feed = () => {
    sfx("cluck");
    if (snack.current !== null) {
      say("bawk?!");
      return;
    }
    if (eaten >= 9) {
      say("i'm stuffed. ship it.", 2000);
      later(4000, () => setEaten(0)); // hungry again soon
      return;
    }
    // Drop it somewhere the chicken has to run to.
    const maxX = Math.max(8, width.current - SIZE - 8);
    let drop = Math.random() * maxX;
    if (Math.abs(drop - pos.current) < 100) drop = pos.current > maxX / 2 ? pos.current - 160 : pos.current + 160;
    drop = Math.min(Math.max(drop, 8), maxX);
    snack.current = drop;
    setSamosa(drop);
    say("bawk!");
    wake.current();
  };

  return (
    <>
      {samosa !== null && (
        <span className="samosa" style={{ left: samosa + SIZE / 2 - 14 }} aria-hidden="true">
          <PixelIcon name="samosa" size={28} />
        </span>
      )}
      <button
        ref={ref}
        type="button"
        className={`chicken is-${mode}`}
        style={{ transform: `translateX(${x}px)`, transitionDuration: `${duration}ms` }}
        aria-label={`Desk chicken (${eaten} samosa${eaten === 1 ? "" : "s"} eaten). Press to feed it a samosa.`}
        onClick={feed}
      >
        <span className="chicken__sprite" data-facing={facing}>
          <span className="chicken__frame chicken__frame--a">
            <PixelIcon name="chicken" size={SIZE} />
          </span>
          <span className="chicken__frame chicken__frame--b">
            <PixelIcon name="chickenStep" size={SIZE} />
          </span>
        </span>
        {bubble && <span className="chicken__bubble">{bubble}</span>}
        {hearts.map((id) => (
          <span key={id} className="chicken__heart" aria-hidden="true">
            <PixelIcon name="heart" size={16} />
          </span>
        ))}
      </button>
    </>
  );
}
