import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export interface MenuItem {
  label: string;
  onSelect: () => void;
}

interface MenuProps {
  items: MenuItem[];
  children: ReactNode;
  /** Accessible name when the button content isn't descriptive text. */
  label?: string;
  buttonClassName?: string;
  placement?: "down" | "up";
}

/** A button that opens a keyboard-navigable menu (arrows, Home/End, Esc). */
export function Menu({ items, children, label, buttonClassName, placement = "down" }: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector("button")?.focus();
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const buttons = [...(listRef.current?.querySelectorAll("button") ?? [])];
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const focusAt = (n: number) => buttons[(n + buttons.length) % buttons.length]?.focus();
    switch (e.key) {
      case "ArrowDown":
        focusAt(i + 1);
        break;
      case "ArrowUp":
        focusAt(i - 1);
        break;
      case "Home":
        focusAt(0);
        break;
      case "End":
        focusAt(buttons.length - 1);
        break;
      case "Escape":
        setOpen(false);
        buttonRef.current?.focus();
        break;
      case "Tab":
        setOpen(false);
        return;
      default:
        return;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={buttonClassName}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
      >
        {children}
      </button>
      {open && (
        <ul id={listId} ref={listRef} role="menu" className={`menu__list menu__list--${placement}`} onKeyDown={onKeyDown}>
          {items.map((item) => (
            <li role="none" key={item.label}>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
