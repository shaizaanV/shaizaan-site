// To feature a video: add its YouTube id (the part after "watch?v=") and a title.
// Thumbnails load automatically from YouTube.

export interface Video {
  id: string;
  title: string;
  /** Optional one-liner shown under the title. */
  blurb?: string;
}

export const videos: Video[] = [];
