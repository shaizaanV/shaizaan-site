// To feature a video: add its YouTube id (the part after "watch?v=") and a title.
// Thumbnails load automatically from YouTube. The first video is on screen when ShaizTV opens.
// While this list is empty, ShaizTV shows a "compiling, releasing soon" screen instead.
//
// Example:
//   { id: "abc123XYZ", title: "I built a plant that texts me", blurb: "ESP32 + a very dramatic basil." },

export interface Video {
  id: string;
  title: string;
  /** Optional one-liner shown under the title. */
  blurb?: string;
}

export const videos: Video[] = [];
