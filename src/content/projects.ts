// To add a project: copy one of the samples below, fill in every field, and
// delete `draft: true`. Drafts only show up in `npm run dev`, never on the live site.

export interface ProjectLinks {
  demo?: string;
  repo?: string;
  video?: string;
}

interface ProjectBase {
  /** URL-safe id, used in share links: shaizaan.com/#projects/<slug> */
  slug: string;
  title: string;
  /** One line that makes someone want to click. */
  hook: string;
  category: "software" | "engineering" | "personal";
  /** What you built, in 1-3 sentences. */
  built: string;
  /** Why you built it. */
  why: string;
  tech: string[];
  /** e.g. "Solo", "Lead programmer on a team of 4" */
  role: string;
  links: ProjectLinks;
  draft?: boolean;
}

// An image always needs alt text describing what it shows.
type ProjectImage = { image: string; imageAlt: string } | { image?: undefined; imageAlt?: undefined };

export type Project = ProjectBase & ProjectImage;

const allProjects: Project[] = [
  {
    slug: "plant-o-matic",
    title: "Plant-o-Matic (sample)",
    hook: "A soil sensor that texts me before my basil dies.",
    category: "engineering",
    built: "An ESP32 moisture probe that logs readings and sends an SMS when the soil dries out.",
    why: "Three dead basil plants. I took it personally.",
    tech: ["C++", "ESP32", "Python", "Fusion 360"],
    role: "Solo: wiring, firmware, 3D-printed case",
    links: { repo: "https://github.com/shaizaanv" },
    draft: true,
  },
  {
    slug: "focus-fox",
    title: "Focus Fox (sample)",
    hook: "A study timer that gets visibly disappointed when you open TikTok.",
    category: "software",
    built: "A Pomodoro web app with a pixel fox that reacts to how long you stay on task.",
    why: "I needed something more persuasive than a plain countdown.",
    tech: ["TypeScript", "React"],
    role: "Solo",
    links: { demo: "https://shaizaan.com" },
    draft: true,
  },
];

export const projects: Project[] = allProjects.filter((p) => import.meta.env.DEV || !p.draft);
