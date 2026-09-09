interface TypewriterOptions {
  text: string;
  speedMs?: number;
  startDelayMs?: number;
}

export function runTypewriter(target: HTMLElement, options: TypewriterOptions): void {
  const { text, speedMs = 38, startDelayMs = 300 } = options;
  let index = 0;
  target.textContent = "";

  const typeNext = () => {
    index += 1;
    target.textContent = text.slice(0, index);
    if (index < text.length) {
      window.setTimeout(typeNext, speedMs);
    }
  };

  window.setTimeout(typeNext, startDelayMs);
}
