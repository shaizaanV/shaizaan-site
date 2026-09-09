export interface InventoryItem {
  icon: string;
  label: string;
}

export const inventory: InventoryItem[] = [
  { icon: "PY", label: "Python" },
  { icon: "C++", label: "C++" },
  { icon: "C", label: "C" },
  { icon: "TS", label: "TypeScript" },
  { icon: "RB", label: "Ruby" },
  { icon: "GIT", label: "Git" },
  { icon: "F360", label: "Fusion360" },
];

export interface DataBankLog {
  id: string;
  emoji: string;
  title: string;
  entries: string[];
}

export const dataBankLogs: DataBankLog[] = [
  {
    id: "media",
    emoji: "\u{1F3AE}",
    title: "Media Log",
    entries: [
      "Cyberpunk 2077",
      "Minecraft",
      "Stardew Valley",
      "Undertale",
      "Breaking Bad",
      "Stranger Things",
      "Dr. Strange",
      "Spider-Man",
      "Iron Man",
    ],
  },
  {
    id: "manga",
    emoji: "\u{1F4DA}",
    title: "Manga Log",
    entries: ["One Piece", "Dragon Ball Z", "One Punch Man"],
  },
  {
    id: "provisions",
    emoji: "\u{1F355}",
    title: "Provisions Log",
    entries: [
      "Chicken 65",
      "Samosa",
      "Mango Lassi",
      "Coke",
      "Tiramisu Matcha",
      "Gulab Jamun",
      "Tiramisu",
      "Caramel & Vanilla Drumsticks",
    ],
  },
  {
    id: "nodes",
    emoji: "\u{1F5FA}",
    title: "Nodes & Systems",
    entries: [
      "VS Code",
      "Discord",
      "Spotify",
      "Meta Glasses",
      "Custom PCs",
      "High-Quality Keyboards",
      "Tokyo",
      "Reykjavik",
      "London",
      "Chickens",
      "Cows",
      "Goats",
      "Chess",
      "Monopoly",
      "Soccer",
      "Basketball",
      "American Football",
    ],
  },
  {
    id: "feeds",
    emoji: "\u{1F3A5}",
    title: "Subscribed Feeds",
    entries: ["TechJoyce", "CarterPCs"],
  },
];

export interface Track {
  title: string;
  hue: number;
}

export const jukeboxTracks: Track[] = [
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
