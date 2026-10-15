// Pure Minesweeper rules. Boards are immutable: every move returns a new board.

export interface Cell {
  bug: boolean;
  /** Bugs in the 8 neighbouring cells. */
  near: number;
  open: boolean;
  flag: boolean;
}

export type Board = Cell[][];

export interface Level {
  id: string;
  label: string;
  rows: number;
  cols: number;
  bugs: number;
}

export const LEVELS: Level[] = [
  { id: "intern", label: "Intern", rows: 8, cols: 8, bugs: 10 },
  { id: "senior", label: "Senior dev", rows: 12, cols: 12, bugs: 24 },
];

export function emptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ bug: false, near: 0, open: false, flag: false }))
  );
}

function neighbours(board: Board, r: number, c: number): [number, number][] {
  const out: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0]!.length) out.push([nr, nc]);
    }
  }
  return out;
}

/** Places bugs anywhere except the first-clicked cell and its neighbours, so the first click opens an area. */
export function placeBugs(board: Board, count: number, safeR: number, safeC: number, rand = Math.random): Board {
  const rows = board.length;
  const cols = board[0]!.length;
  const safe = new Set([`${safeR},${safeC}`, ...neighbours(board, safeR, safeC).map(([r, c]) => `${r},${c}`)]);
  const spots: [number, number][] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (!safe.has(`${r},${c}`)) spots.push([r, c]);
  for (let i = spots.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [spots[i], spots[j]] = [spots[j]!, spots[i]!];
  }
  const next = board.map((row) => row.map((cell) => ({ ...cell, bug: false })));
  for (const [r, c] of spots.slice(0, count)) next[r]![c]!.bug = true;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      next[r]![c]!.near = neighbours(next, r, c).filter(([nr, nc]) => next[nr]![nc]!.bug).length;
    }
  }
  return next;
}

export interface MoveResult {
  board: Board;
  /** The bug that was opened, if any. */
  hit: [number, number] | null;
}

/** Opens a cell; zero cells flood-fill outwards. Flagged and open cells are ignored. */
export function reveal(board: Board, r: number, c: number): MoveResult {
  const start = board[r]![c]!;
  if (start.open || start.flag) return { board, hit: null };
  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  if (start.bug) {
    next[r]![c]!.open = true;
    return { board: next, hit: [r, c] };
  }
  const stack: [number, number][] = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    const cell = next[cr]![cc]!;
    if (cell.open || cell.flag) continue;
    cell.open = true;
    if (cell.near === 0) stack.push(...neighbours(next, cr, cc));
  }
  return { board: next, hit: null };
}

/** On an open number whose flags match it, opens every unflagged neighbour. */
export function chord(board: Board, r: number, c: number): MoveResult {
  const cell = board[r]![c]!;
  if (!cell.open || cell.near === 0) return { board, hit: null };
  const around = neighbours(board, r, c);
  const flags = around.filter(([nr, nc]) => board[nr]![nc]!.flag).length;
  if (flags !== cell.near) return { board, hit: null };
  let result: MoveResult = { board, hit: null };
  for (const [nr, nc] of around) {
    const step = reveal(result.board, nr, nc);
    result = { board: step.board, hit: result.hit ?? step.hit };
  }
  return result;
}

export function toggleFlag(board: Board, r: number, c: number): Board {
  if (board[r]![c]!.open) return board;
  return board.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c ? { ...cell, flag: !cell.flag } : cell)));
}

export function isWon(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell.bug || cell.open));
}

/** End of game: show every bug. */
export function revealBugs(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell.bug ? { ...cell, open: true } : cell)));
}

export function flagCount(board: Board): number {
  return board.reduce((n, row) => n + row.filter((cell) => cell.flag).length, 0);
}
