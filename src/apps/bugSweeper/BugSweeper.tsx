import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import { PixelIcon } from "../../os/PixelIcon";
import { useSound } from "../../os/sound";
import type { AppProps } from "../registry";
import {
  LEVELS,
  chord,
  emptyBoard,
  flagCount,
  isWon,
  placeBugs,
  reveal,
  revealBugs,
  toggleFlag,
  type Board,
  type Level,
  type MoveResult,
} from "./logic";
import "./bugSweeper.css";

type Status = "ready" | "playing" | "won" | "lost";

const LONG_PRESS_MS = 400;
const FACE: Record<Status, string> = { ready: ":)", playing: ":)", won: "B)", lost: "X(" };
const bestKey = (level: Level) => `bugsweeper.best.${level.id}`;

function readBest(level: Level): number | null {
  try {
    const v = Number(localStorage.getItem(bestKey(level)));
    return v > 0 ? v : null;
  } catch {
    return null;
  }
}

export function BugSweeper(_props: AppProps) {
  const { sfx } = useSound();
  const [level, setLevel] = useState<Level>(LEVELS[0]!);
  const [board, setBoard] = useState<Board>(() => emptyBoard(level.rows, level.cols));
  const [status, setStatus] = useState<Status>("ready");
  const [hit, setHit] = useState<[number, number] | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const [focus, setFocus] = useState<[number, number]>([0, 0]);
  const [best, setBest] = useState<number | null>(() => readBest(level));
  const cells = useRef(new Map<string, HTMLButtonElement>());
  const pressTimer = useRef<number>();
  const longPressAt = useRef(0);

  const over = status === "won" || status === "lost";

  useEffect(() => {
    if (status !== "playing") return;
    const id = window.setInterval(() => setSeconds((s) => Math.min(s + 1, 999)), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  const newGame = (next: Level = level) => {
    setLevel(next);
    setBoard(emptyBoard(next.rows, next.cols));
    setStatus("ready");
    setHit(null);
    setSeconds(0);
    setFocus([0, 0]);
    setBest(readBest(next));
  };

  const finish = (result: MoveResult) => {
    if (result.hit) {
      setBoard(revealBugs(result.board));
      setHit(result.hit);
      setStatus("lost");
      sfx("lose");
      return;
    }
    setBoard(result.board);
    if (isWon(result.board)) {
      setStatus("won");
      sfx("win");
      if (best === null || seconds < best) {
        setBest(seconds);
        try {
          localStorage.setItem(bestKey(level), String(seconds));
        } catch {
          // Best time just isn't remembered.
        }
      }
    } else {
      sfx("select");
    }
  };

  const open = (r: number, c: number) => {
    if (over) return;
    if (status === "ready") {
      setStatus("playing");
      finish(reveal(placeBugs(board, level.bugs, r, c), r, c));
      return;
    }
    const cell = board[r]![c]!;
    finish(cell.open ? chord(board, r, c) : reveal(board, r, c));
  };

  const flag = (r: number, c: number) => {
    if (over || board[r]![c]!.open) return;
    setBoard(toggleFlag(board, r, c));
    sfx("select");
  };

  const onCellClick = (r: number, c: number) => {
    if (Date.now() - longPressAt.current < 600) return; // the click that ends a long-press
    if (flagMode) flag(r, c);
    else open(r, c);
  };

  const onContextMenu = (e: MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (Date.now() - longPressAt.current < 600) return; // Android fires this after our own long-press
    flag(r, c);
  };

  const onPointerDown = (pointerType: string, r: number, c: number) => {
    if (pointerType !== "touch") return;
    window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => {
      longPressAt.current = Date.now();
      flag(r, c);
    }, LONG_PRESS_MS);
  };
  const cancelPress = () => window.clearTimeout(pressTimer.current);

  const onGridKeyDown = (e: KeyboardEvent) => {
    const [r, c] = focus;
    const moves: Record<string, [number, number]> = {
      ArrowUp: [r - 1, c],
      ArrowDown: [r + 1, c],
      ArrowLeft: [r, c - 1],
      ArrowRight: [r, c + 1],
    };
    if (moves[e.key]) {
      e.preventDefault();
      const nr = Math.min(Math.max(moves[e.key]![0], 0), level.rows - 1);
      const nc = Math.min(Math.max(moves[e.key]![1], 0), level.cols - 1);
      setFocus([nr, nc]);
      cells.current.get(`${nr},${nc}`)?.focus();
    } else if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      flag(r, c);
    }
  };

  const bugsLeft = level.bugs - flagCount(board);
  const message =
    status === "won"
      ? `0 bugs in production. Shipped in ${seconds}s!`
      : status === "lost"
        ? `Segfault! You found a bug the hard way.`
        : status === "ready"
          ? "Click any square to start. The first one is always safe."
          : flagMode
            ? "Flag mode: taps place flags."
            : "Right-click, long-press or press F to flag.";

  return (
    <div className="sweeper">
      <div className="sweeper__levels" role="group" aria-label="Difficulty">
        {LEVELS.map((l) => (
          <button key={l.id} type="button" className="bevel" aria-pressed={l.id === level.id} onClick={() => newGame(l)}>
            {l.label}
          </button>
        ))}
        <button
          type="button"
          className="bevel sweeper__flagmode"
          aria-pressed={flagMode}
          onClick={() => setFlagMode((f) => !f)}
        >
          <PixelIcon name="flag" size={16} /> Flag mode
        </button>
      </div>

      <div className="sweeper__panel">
        <div className="sweeper__head">
          <span className="sweeper__lcd" aria-label={`${bugsLeft} bugs left`}>
            {String(Math.max(bugsLeft, -99)).padStart(3, "0")}
          </span>
          <button type="button" className="bevel sweeper__face" onClick={() => newGame()} aria-label="New game">
            {FACE[status]}
          </button>
          <span className="sweeper__lcd" aria-label={`${seconds} seconds`}>
            {String(seconds).padStart(3, "0")}
          </span>
        </div>

        <div
          className="sweeper__grid"
          role="grid"
          aria-label={`Bug Sweeper, ${level.rows} by ${level.cols}`}
          style={{ "--cols": level.cols } as CSSProperties}
          onKeyDown={onGridKeyDown}
        >
          {board.map((row, r) => (
            <div role="row" key={r} className="sweeper__row">
              {row.map((cell, c) => {
                const isHit = hit?.[0] === r && hit[1] === c;
                const label = cell.open
                  ? cell.bug
                    ? "bug"
                    : cell.near
                      ? `${cell.near} bug${cell.near > 1 ? "s" : ""} nearby`
                      : "clear"
                  : cell.flag
                    ? "flagged"
                    : "hidden";
                return (
                  <div role="gridcell" key={c}>
                    <button
                      ref={(el) => {
                        if (el) cells.current.set(`${r},${c}`, el);
                        else cells.current.delete(`${r},${c}`);
                      }}
                      type="button"
                      className={`sweeper__cell${cell.open ? " is-open" : ""}${isHit ? " is-hit" : ""}`}
                      data-near={cell.open && !cell.bug ? cell.near : undefined}
                      tabIndex={focus[0] === r && focus[1] === c ? 0 : -1}
                      aria-label={`Row ${r + 1}, column ${c + 1}: ${label}`}
                      onFocus={() => setFocus([r, c])}
                      onClick={() => onCellClick(r, c)}
                      onContextMenu={(e) => onContextMenu(e, r, c)}
                      onPointerDown={(e) => onPointerDown(e.pointerType, r, c)}
                      onPointerUp={cancelPress}
                      onPointerLeave={cancelPress}
                      onPointerCancel={cancelPress}
                    >
                      {cell.open && cell.bug ? (
                        <PixelIcon name="bug" size={20} />
                      ) : cell.open ? (
                        cell.near || ""
                      ) : cell.flag ? (
                        <PixelIcon name="flag" size={20} />
                      ) : null}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p className={`sweeper__msg${over ? ` is-${status}` : ""}`} role="status">
        {message}
      </p>
      <p className="sweeper__best muted">
        Best on {level.label}: {best === null ? "none yet" : `${best}s`}
      </p>
    </div>
  );
}
