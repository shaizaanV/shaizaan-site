// Original chiptunes for Shaizintosh. Each song is a 4-bar loop of 16th-note steps (64 steps).
// Notes are [step, note, length in steps].

export type NoteEvent = [step: number, note: string, len: number];

export interface Song {
  id: string;
  title: string;
  vibe: string;
  bpm: number;
  lead: NoteEvent[];
  bass: NoteEvent[];
  /** One chord per bar, arpeggiated in 16ths underneath the melody. */
  chords: string[][];
  arpVolume: number;
  /** Steps within each bar (0-15), repeated every bar. */
  drums: { kick: number[]; snare: number[]; hat: number[] };
}

/** Root + octave + fifth pattern for each bar's bass note. */
function bassLine(roots: string[], pattern: [step: number, interval: "root" | "oct" | "fifth", len: number][]): NoteEvent[] {
  const up = (note: string, semis: number) => {
    const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const m = /^([A-G]#?)(\d)$/.exec(note)!;
    const n = names.indexOf(m[1]!) + Number(m[2]) * 12 + semis;
    return `${names[n % 12]}${Math.floor(n / 12)}`;
  };
  const shift = { root: 0, oct: 12, fifth: 7 };
  return roots.flatMap((root, bar) => pattern.map(([s, iv, len]): NoteEvent => [bar * 16 + s, up(root, shift[iv]), len]));
}

export const songs: Song[] = [
  {
    id: "matcha-morning",
    title: "Matcha Morning",
    vibe: "Chill. Good for studying.",
    bpm: 96,
    lead: [
      [0, "E5", 2], [2, "G5", 2], [4, "C6", 3], [8, "B5", 2], [10, "G5", 2], [12, "E5", 4],
      [16, "A5", 2], [18, "C6", 2], [20, "E6", 3], [24, "D6", 2], [26, "C6", 2], [28, "A5", 4],
      [32, "F5", 2], [34, "A5", 2], [36, "C6", 3], [40, "A5", 2], [42, "F5", 2], [44, "G5", 4],
      [48, "G5", 2], [50, "B5", 2], [52, "D6", 2], [54, "B5", 2], [56, "G5", 2], [58, "F5", 2], [60, "D5", 4],
    ],
    bass: bassLine(["C2", "A1", "F1", "G1"], [[0, "root", 4], [6, "oct", 2], [8, "root", 4], [14, "fifth", 2]]),
    chords: [
      ["C4", "E4", "G4", "E4"],
      ["A3", "C4", "E4", "C4"],
      ["F3", "A3", "C4", "A3"],
      ["G3", "B3", "D4", "B3"],
    ],
    arpVolume: 0.025,
    drums: { kick: [0, 8], snare: [4, 12], hat: [2, 6, 10, 14] },
  },
  {
    id: "compile-time",
    title: "Compile Time",
    vibe: "Upbeat. Good for building.",
    bpm: 132,
    lead: [
      [0, "A5", 1], [1, "C6", 1], [2, "E6", 2], [4, "A5", 2], [6, "E6", 1], [7, "D6", 1], [8, "C6", 2], [10, "B5", 2], [12, "A5", 4],
      [16, "F5", 2], [18, "A5", 2], [20, "C6", 2], [22, "A5", 2], [24, "F6", 3], [28, "E6", 4],
      [32, "E6", 2], [34, "D6", 2], [36, "C6", 2], [38, "G5", 2], [40, "C6", 2], [42, "E6", 2], [44, "G6", 4],
      [48, "D6", 2], [50, "B5", 2], [52, "G5", 2], [54, "B5", 2], [56, "D6", 2], [58, "G6", 2], [60, "F6", 2], [62, "D6", 2],
    ],
    bass: bassLine(
      ["A1", "F1", "C2", "G1"],
      [[0, "root", 2], [2, "root", 2], [4, "oct", 2], [6, "root", 2], [8, "root", 2], [10, "fifth", 2], [12, "oct", 2], [14, "root", 2]]
    ),
    chords: [
      ["A3", "C4", "E4"],
      ["F3", "A3", "C4"],
      ["C4", "E4", "G4"],
      ["G3", "B3", "D4"],
    ],
    arpVolume: 0.02,
    drums: { kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14] },
  },
];
