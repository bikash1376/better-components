export interface Pattern {
  id: string;
  name: string;
  category: string;
  badge?: string;
  description: string;
  style: React.CSSProperties;
}

export const gridPatterns: Pattern[] = [
  {
    id: "random-blur-blobs",
    name: "Random Blur Blobs",
    category: "decorative",
    badge: "New",
    description: "Randomly generated blurred blob background similar to Haikei.",
    style: {
      background: "black",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
  }
];
