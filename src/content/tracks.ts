export interface Track {
  title: string;
  hue: number;
  /** Optional Spotify or YouTube link. */
  url?: string;
}

export const tracks: Track[] = [
  { title: "Black and Yellow", hue: 260 },
  { title: "God's Plan", hue: 200 },
  { title: "Headlines", hue: 320 },
  { title: "The Less I Know the Better", hue: 280 },
  { title: "Freebird", hue: 20 },
  { title: "Life Goes On", hue: 150 },
  { title: "Feel Good Inc", hue: 100 },
  { title: "Song 2", hue: 0 },
  { title: "Can't Stop", hue: 340 },
];
