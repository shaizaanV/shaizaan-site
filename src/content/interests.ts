export interface InterestLog {
  id: string;
  emoji: string;
  title: string;
  entries: string[];
}

export const interests: InterestLog[] = [
  {
    id: 'media',
    emoji: '\u{1F3AE}',
    title: 'Media Log',
    entries: [
      'Cyberpunk 2077',
      'Minecraft',
      'Breaking Bad',
      'Stranger Things',
      'Dr. Strange',
      'Spider-Man',
    ],
  },
  {
    id: 'provisions',
    emoji: '\u{1F355}',
    title: 'Provisions Log',
    entries: [
      'Chicken 65',
      'Samosa',
      'Mango Lassi',
      'Coke',
      'Tiramisu Matcha',
      'Gulab Jamun',
      'Tiramisu',
      'Caramel & Vanilla Drumsticks',
    ],
  },
  {
    id: 'nodes',
    emoji: '\u{1F5FA}',
    title: 'Nodes & Systems',
    entries: [
      'VS Code',
      'Discord',
      'Spotify',
      'Meta Glasses',
      'Custom PCs',
      'High-Quality Keyboards',
      'Tokyo',
      'Reykjavik',
      'London',
      'Chickens',
      'Cows',
      'Goats',
      'Chess',
      'Monopoly',
      'Soccer',
      'Basketball',
      'American Football',
    ],
  },
];
