import { useRef, type KeyboardEvent } from "react";
import { interests } from "../content/interests";
import type { AppProps } from "./registry";
import "./interests.css";

/** Tabbed logs of non-work favourites. params = log id (#interests/manga). */
export function Interests({ params, setParams }: AppProps) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = Math.max(
    0,
    interests.findIndex((log) => log.id === params)
  );
  const active = interests[activeIndex]!;

  const select = (i: number) => {
    const n = (i + interests.length) % interests.length;
    setParams(interests[n]!.id);
    tabs.current[n]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: activeIndex + 1,
      ArrowLeft: activeIndex - 1,
      Home: 0,
      End: interests.length - 1,
    };
    const target = moves[e.key];
    if (target === undefined) return;
    e.preventDefault();
    select(target);
  };

  return (
    <div className="interests">
      <p className="interests__intro muted">Off the clock: the games, shows, food and places I'm into.</p>

      <div className="interests__tabs" role="tablist" aria-label="Interest logs" onKeyDown={onKeyDown}>
        {interests.map((log, i) => {
          const selected = i === activeIndex;
          return (
            <button
              key={log.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`interests-tab-${log.id}`}
              aria-selected={selected}
              aria-controls={`interests-panel-${log.id}`}
              tabIndex={selected ? 0 : -1}
              className="bevel interests__tab"
              onClick={() => setParams(log.id)}
            >
              <span aria-hidden="true">{log.emoji}</span> {log.title}
            </button>
          );
        })}
      </div>

      <div
        className="interests__panel"
        role="tabpanel"
        id={`interests-panel-${active.id}`}
        aria-labelledby={`interests-tab-${active.id}`}
        tabIndex={0}
      >
        <p className="interests__count">
          {active.entries.length} {active.entries.length === 1 ? "entry" : "entries"}
        </p>
        <ul className="interests__entries">
          {active.entries.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
