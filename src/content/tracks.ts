// Songs on repeat, shown in the Jukebox app. Add, remove or reorder freely.
// Paste a Spotify link into `spotify` and the track gets a "Play on Spotify" button.

export interface Track {
  title: string;
  artist?: string;
  /** e.g. "https://open.spotify.com/track/..." Leave empty for no link. */
  spotify?: string;
}

export const tracks: Track[] = [
  { title: "Black and Yellow", spotify: "" },
  { title: "God's Plan", spotify: "" },
  { title: "Headlines", spotify: "" },
  { title: "The Less I Know the Better", spotify: "" },
  { title: "Freebird", spotify: "" },
  { title: "Life Goes On", spotify: "" },
  { title: "Feel Good Inc", spotify: "" },
  { title: "Song 2", spotify: "" },
  { title: "Can't Stop", spotify: "" },
];
