import type { ComponentType } from "react";
import type { IconName } from "../os/icons";
import { BugSweeper } from "./bugSweeper/BugSweeper";
import { About } from "./About";
import { Interests } from "./Interests";
import { Jukebox } from "./Jukebox";
import { Mail } from "./Mail";
import { NotFound } from "./NotFound";
import { OldSite } from "./OldSite";
import { Projects } from "./Projects";
import { Readme } from "./Readme";
import { Terminal } from "./Terminal";
import { Trash } from "./Trash";
import { Tv } from "./Tv";

export interface AppProps {
  /** Route state from the URL hash, e.g. "plant-o-matic" in #projects/plant-o-matic. */
  params: string;
  open: (id: AppId, params?: string) => void;
  setParams: (params: string) => void;
  /** Closes this app's window. */
  close: () => void;
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
  /** false = hidden app (easter eggs): not in the Start menu either. */
  menu?: boolean;
  /** Default window size in px; capped to the screen. */
  size: { w: number; h: number };
  component: ComponentType<AppProps>;
}

export type AppId = "readme" | "projects" | "about" | "tv" | "mail" | "interests" | "jukebox" | "games" | "trash" | "terminal" | "oldsite" | "notfound";

// To add an app: add its id to AppId, then add an entry here. Order = desktop/Start menu order.
export const apps: AppDef[] = [
  { id: "readme", label: "README.txt", title: "README.txt", icon: "doc", desktop: true, size: { w: 460, h: 340 }, component: Readme },
  { id: "projects", label: "Projects", title: "Projects", icon: "folder", desktop: true, size: { w: 640, h: 480 }, component: Projects },
  { id: "about", label: "About Me", title: "About Me", icon: "person", desktop: true, size: { w: 560, h: 560 }, component: About },
  { id: "tv", label: "ShaizTV", title: "ShaizTV", icon: "tv", desktop: true, size: { w: 640, h: 600 }, component: Tv },
  { id: "mail", label: "Mail", title: "Mail", icon: "mail", desktop: true, size: { w: 480, h: 560 }, component: Mail },
  { id: "interests", label: "Interests", title: "Interests", icon: "heart", desktop: true, size: { w: 580, h: 480 }, component: Interests },
  { id: "jukebox", label: "Jukebox", title: "Jukebox", icon: "cassette", desktop: true, size: { w: 480, h: 600 }, component: Jukebox },
  { id: "games", label: "Bug Sweeper", title: "Bug Sweeper", icon: "joy", desktop: true, size: { w: 460, h: 600 }, component: BugSweeper },
  { id: "trash", label: "Trash", title: "Trash", icon: "trash", desktop: true, size: { w: 420, h: 340 }, component: Trash },
  // Hidden apps (easter eggs)
  { id: "terminal", label: "Terminal", title: "Terminal", icon: "terminal", desktop: false, menu: false, size: { w: 560, h: 380 }, component: Terminal },
  { id: "oldsite", label: "old_site.zip", title: "old_site.zip", icon: "zip", desktop: false, menu: false, size: { w: 560, h: 480 }, component: OldSite },
  { id: "notfound", label: "File not found", title: "File not found", icon: "floppy", desktop: false, menu: false, size: { w: 440, h: 460 }, component: NotFound },
];

export const appsById = Object.fromEntries(apps.map((a) => [a.id, a])) as Record<AppId, AppDef>;
