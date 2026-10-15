import type { ComponentType } from "react";
import type { IconName } from "../os/icons";
import { About } from "./About";
import { Mail } from "./Mail";
import { placeholder } from "./Placeholder";
import { Projects } from "./Projects";
import { Readme } from "./Readme";

export interface AppProps {
  /** Route state from the URL hash, e.g. "plant-o-matic" in #projects/plant-o-matic. */
  params: string;
  open: (id: AppId, params?: string) => void;
  setParams: (params: string) => void;
}

export interface AppDef {
  id: AppId;
  /** Desktop icon and Start menu label. */
  label: string;
  /** Window title bar and taskbar label. */
  title: string;
  icon: IconName;
  /** Show an icon on the desktop (otherwise Start menu only). */
  desktop: boolean;
  /** Default window size in px; capped to the screen. */
  size: { w: number; h: number };
  component: ComponentType<AppProps>;
}

export type AppId = "readme" | "projects" | "about" | "tv" | "mail" | "interests" | "games" | "trash";

// To add an app: add its id to AppId, then add an entry here. Order = desktop/Start menu order.
export const apps: AppDef[] = [
  { id: "readme", label: "README.txt", title: "README.txt", icon: "doc", desktop: true, size: { w: 460, h: 340 }, component: Readme },
  { id: "projects", label: "Projects", title: "Projects", icon: "folder", desktop: true, size: { w: 640, h: 480 }, component: Projects },
  { id: "about", label: "About Me", title: "About Me", icon: "person", desktop: true, size: { w: 560, h: 560 }, component: About },
  { id: "tv", label: "ShaizTV", title: "ShaizTV", icon: "tv", desktop: true, size: { w: 600, h: 440 }, component: placeholder("ShaizTV") },
  { id: "mail", label: "Mail", title: "Mail", icon: "mail", desktop: true, size: { w: 480, h: 560 }, component: Mail },
  { id: "interests", label: "Interests", title: "Interests", icon: "heart", desktop: true, size: { w: 520, h: 440 }, component: placeholder("Interests") },
  { id: "games", label: "Bug Sweeper", title: "Bug Sweeper", icon: "joy", desktop: true, size: { w: 360, h: 420 }, component: placeholder("Bug Sweeper") },
  { id: "trash", label: "Trash", title: "Trash", icon: "trash", desktop: true, size: { w: 360, h: 260 }, component: placeholder("Trash") },
];

export const appsById = Object.fromEntries(apps.map((a) => [a.id, a])) as Record<AppId, AppDef>;
