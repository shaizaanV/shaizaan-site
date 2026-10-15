import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { OS_NAME } from "../os/brand";
import { emitEgg } from "../os/eggs/events";
import { apps, type AppProps } from "./registry";
import "./terminal.css";

interface Line {
  kind: "in" | "out";
  text: string;
}

const PROMPT = "guest@shaizintosh:~$";
const BANNER = `${OS_NAME} Terminal v1.0. Type "help" to see what you can do.`;
const bootedAt = Date.now();

const FILES: Record<string, string> = {
  "one_piece.txt": "The One Piece is real. Chapter count: yes.",
  "todo.txt": "1. Finish portfolio ✓\n2. Feed the desk chicken\n3. Sleep (pending since forever)",
  "secrets/nice_try.txt": "There are no secrets here. Except the Konami code. Oops.",
};

const HELP = [
  "help                 this list",
  "ls [dir]             list files",
  "cat <file>           read a file",
  "open <app>           open an app (projects, about, tv, mail…)",
  "whoami / date / neofetch",
  "matcha / hapkido     you'll see",
  "sudo make me a samosa",
  "clear / exit",
].join("\n");

/** Returns the output for a command; null means print nothing. */
function run(input: string, ctx: { open: AppProps["open"]; clear: () => void }): string | null {
  const cmd = input.trim();
  if (!cmd) return null;
  const [name = "", ...args] = cmd.split(/\s+/);
  const arg = args.join(" ");

  if (cmd === "sudo make me a samosa") {
    emitEgg("feed");
    return "[sudo] password for guest: ********\nOkay. One samosa, delivered to the desk chicken.";
  }
  if (cmd === "make me a samosa") return "What? Make it yourself.";
  if (/^rm\s+-rf/.test(cmd)) return "Permission denied. Also, rude.";

  switch (name) {
    case "help":
      return HELP;
    case "ls":
      if (/^(~\/)?secrets\/?$/.test(arg)) return "nice_try.txt";
      if (arg) return `ls: ${arg}: No such directory`;
      return "projects/  videos/  secrets/  one_piece.txt  todo.txt";
    case "cat": {
      const file = arg.replace(/^~\//, "");
      if (!file) return "cat: which file? Try: cat todo.txt";
      const text = FILES[file] ?? (file === "nice_try.txt" ? FILES["secrets/nice_try.txt"] : undefined);
      return text ?? `cat: ${arg}: No such file`;
    }
    case "open": {
      const target = arg.toLowerCase();
      const app = apps.find((a) => a.menu !== false && (a.id === target || a.label.toLowerCase() === target));
      if (!app) return `open: no app called "${arg}". Try: open projects`;
      ctx.open(app.id);
      return `Opening ${app.label}…`;
    }
    case "whoami":
      return "guest. But you're welcome here.";
    case "date":
      return new Date().toString();
    case "echo":
      return arg;
    case "cd":
      return "There's nowhere to go. It's a website.";
    case "sudo":
      return "guest is not in the sudoers file. This incident will be reported to the desk chicken.";
    case "matcha":
      emitEgg("matcha");
      return "Pouring…";
    case "hapkido":
      emitEgg("hapkido");
      return "Kiai!";
    case "neofetch": {
      const mins = Math.round((Date.now() - bootedAt) / 60000);
      return [
        "guest@shaizintosh",
        "-----------------",
        `OS: ${OS_NAME} 1.0 (Matcha)`,
        "Host: shaizaan.com",
        "Kernel: React 18",
        "Shell: shaizsh",
        `Uptime: ${mins} min`,
        `Packages: ${apps.filter((a) => a.menu !== false).length} apps, 1 chicken`,
      ].join("\n");
    }
    case "clear":
      ctx.clear();
      return null;
    default:
      return `shaizsh: command not found: ${name}. Try "help".`;
  }
}

export function Terminal({ open, close }: AppProps) {
  const [lines, setLines] = useState<Line[]>([{ kind: "out", text: BANNER }]);
  const [input, setInput] = useState("");
  const history = useRef<string[]>([]);
  const historyIndex = useRef(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const cmd = input;
      setInput("");
      if (cmd.trim()) history.current.unshift(cmd);
      historyIndex.current = -1;
      if (cmd.trim() === "exit") {
        close();
        return;
      }
      let cleared = false;
      const out = run(cmd, { open, clear: () => (cleared = true) });
      setLines((prev) => {
        if (cleared) return [];
        const next: Line[] = [...prev, { kind: "in", text: cmd }];
        if (out !== null) next.push({ kind: "out", text: out });
        return next;
      });
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const h = history.current;
      if (!h.length) return;
      historyIndex.current =
        e.key === "ArrowUp" ? Math.min(historyIndex.current + 1, h.length - 1) : Math.max(historyIndex.current - 1, -1);
      setInput(historyIndex.current === -1 ? "" : h[historyIndex.current]!);
    }
  };

  return (
    <div className="term" onClick={() => inputRef.current?.focus()}>
      <div className="term__log" role="log" aria-live="polite">
        {lines.map((line, i) => (
          <pre key={i} className={`term__line term__line--${line.kind}`}>
            {line.kind === "in" ? `${PROMPT} ${line.text}` : line.text}
          </pre>
        ))}
        <div className="term__input-row" ref={endRef}>
          <label htmlFor="term-input" className="term__prompt">
            {PROMPT}
          </label>
          <input
            id="term-input"
            ref={inputRef}
            className="term__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
