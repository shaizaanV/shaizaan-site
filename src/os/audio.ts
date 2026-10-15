// Tiny Web Audio synth: UI sound effects plus a step sequencer for chiptune songs.
// Nothing here makes a sound until `unlock()` runs from a user gesture (the sound toggle).

import type { Song } from "./songs";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

/** Create/resume the audio context. Call from a click or key press. */
export function unlock(): void {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
}

const NOTE_INDEX: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "C#5" -> MIDI note number. */
export function midi(note: string): number {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(note);
  if (!m) throw new Error(`Bad note: ${note}`);
  const accidental = m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0;
  return 12 * (Number(m[3]) + 1) + NOTE_INDEX[m[1]!]! + accidental;
}

const hz = (n: number) => 440 * 2 ** ((n - 69) / 12);

function tone(dest: AudioNode, n: number, start: number, dur: number, type: OscillatorType, vol: number): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = hz(n);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.005);
  gain.gain.setValueAtTime(vol, start + Math.max(0.01, dur - 0.03));
  gain.gain.linearRampToValueAtTime(0, start + dur);
  osc.connect(gain).connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function noise(dest: AudioNode, start: number, dur: number, vol: number, cutoff: number): void {
  if (!ctx || !noiseBuffer) return;
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  src.buffer = noiseBuffer;
  filter.type = "highpass";
  filter.frequency.value = cutoff;
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  src.connect(filter).connect(gain).connect(dest);
  src.start(start);
  src.stop(start + dur);
}

function kick(dest: AudioNode, start: number): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(150, start);
  osc.frequency.exponentialRampToValueAtTime(40, start + 0.12);
  gain.gain.setValueAtTime(0.5, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
  osc.connect(gain).connect(dest);
  osc.start(start);
  osc.stop(start + 0.16);
}

// ---------- sound effects ----------

export type Sfx = "open" | "close" | "minimize" | "boot" | "on" | "select" | "win" | "lose" | "cluck" | "chomp";

const SFX: Record<Sfx, [note: string, at: number, dur: number][]> = {
  open: [["C5", 0, 0.05], ["G5", 0.05, 0.08]],
  close: [["G5", 0, 0.05], ["C5", 0.05, 0.08]],
  minimize: [["E5", 0, 0.04], ["C5", 0.04, 0.04], ["G4", 0.08, 0.06]],
  select: [["A5", 0, 0.03]],
  on: [["C5", 0, 0.08], ["E5", 0.08, 0.08], ["G5", 0.16, 0.12]],
  win: [["C5", 0, 0.08], ["E5", 0.08, 0.08], ["G5", 0.16, 0.08], ["C6", 0.24, 0.08], ["G5", 0.32, 0.08], ["C6", 0.4, 0.3]],
  lose: [["E4", 0, 0.12], ["C4", 0.12, 0.12], ["A3", 0.24, 0.35]],
  cluck: [["A5", 0, 0.04], ["E6", 0.05, 0.05]],
  chomp: [["C4", 0, 0.04], ["C4", 0.09, 0.04]],
  boot: [["C5", 0, 0.12], ["G4", 0.12, 0.12], ["C5", 0.24, 0.12], ["E5", 0.36, 0.12], ["G5", 0.48, 0.12], ["C6", 0.6, 0.4]],
};

export function playSfx(name: Sfx): void {
  if (!ctx || !master || ctx.state !== "running") return;
  const t = ctx.currentTime + 0.01;
  for (const [note, at, dur] of SFX[name]) tone(master, midi(note), t + at, dur, "square", 0.08);
}

// ---------- music ----------

const LOOKAHEAD = 0.12; // seconds of notes scheduled ahead
let timer: number | undefined;
let bus: GainNode | null = null;

export function stopMusic(): void {
  window.clearInterval(timer);
  timer = undefined;
  if (bus && ctx) {
    const old = bus;
    old.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
    window.setTimeout(() => old.disconnect(), 300);
  }
  bus = null;
}

export function playSong(song: Song): void {
  unlock();
  stopMusic();
  if (!ctx || !master) return;
  const c = ctx;
  const out = c.createGain();
  out.gain.value = 0.9;
  out.connect(master);
  bus = out;

  const stepDur = 60 / song.bpm / 4; // 16th notes
  const byStep = new Map<number, (t: number) => void>();
  const add = (step: number, fn: (t: number) => void) => {
    const prev = byStep.get(step);
    byStep.set(step, prev ? (t) => (prev(t), fn(t)) : fn);
  };
  for (const [step, note, len] of song.lead) add(step, (t) => tone(out, midi(note), t, len * stepDur * 0.95, "square", 0.07));
  for (const [step, note, len] of song.bass) add(step, (t) => tone(out, midi(note), t, len * stepDur * 0.9, "triangle", 0.22));
  song.chords.forEach((chord, bar) => {
    for (let i = 0; i < 16; i++) {
      const note = chord[i % chord.length]!;
      add(bar * 16 + i, (t) => tone(out, midi(note), t, stepDur * 0.6, "square", song.arpVolume));
    }
  });
  for (let bar = 0; bar < song.chords.length; bar++) {
    for (const s of song.drums.kick) add(bar * 16 + s, (t) => kick(out, t));
    for (const s of song.drums.snare) add(bar * 16 + s, (t) => noise(out, t, 0.12, 0.18, 1500));
    for (const s of song.drums.hat) add(bar * 16 + s, (t) => noise(out, t, 0.03, 0.06, 7000));
  }

  const length = song.chords.length * 16;
  let step = 0;
  let next = c.currentTime + 0.05;
  const schedule = () => {
    while (next < c.currentTime + LOOKAHEAD) {
      byStep.get(step)?.(next);
      next += stepDur;
      step = (step + 1) % length;
    }
  };
  schedule();
  timer = window.setInterval(schedule, 25);
}
