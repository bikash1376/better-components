'use client'

export interface Pattern {
  id: string;
  name: string;
  category: string;
  badge?: string;
  description: string;
  style: React.CSSProperties;
  code: string;
}

// Helper to make a blob gradient with dynamic clip-path
const blobGradient = (
  colors: [string, string],
  size: number,
  position: [string, string]
) => {
  return `
    radial-gradient(circle at ${position[0]} ${position[1]}, ${colors[0]}, ${colors[1]})
  `;
};

export const gridPatterns: Pattern[] = [
  {
    id: "simple-radial-gradient",
    name: "Simple Radial Gradient",
    category: "decorative",
    badge: "New",
    description: "A clean, minimal radial gradient without blob effects.",
    style: {
      background: `radial-gradient(circle,rgba(0, 89, 71, 1) 0%, rgba(0, 2, 15, 1) 58%)`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: "brightness(0.9)",
    },
    code: `
export default function SimpleRadialGradient() {
  return (
    <div className="min-h-screen w-full relative bg-black">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: radial-gradient(circle,rgba(0, 89, 71, 1) 0%, rgba(0, 2, 15, 1) 58%);

          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.9)",
        }}
      />
    </div>
  );
}
    `,
  },
];

