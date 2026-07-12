import type { ReactNode } from "react"
import Image from "next/image"

import type { PropRow } from "@/lib/props"

import { TextShimmer } from "@/components/better/text-shimmer"
import { Avatar, type AvatarStyle } from "@/components/better/avatar"
import { StopMotion } from "@/components/better/stop-motion"
import { Animate } from "@/components/better/animate"
import { DotsLoader } from "@/components/better/dots-loader"
import { BarLoader } from "@/components/better/bar-loader"
import { GridPulse } from "@/components/better/grid-pulse"
import { RingSpinner } from "@/components/better/ring-spinner"
import { OrbitLoader } from "@/components/better/orbit-loader"
import { MagneticButton } from "@/components/better/magnetic-button"
import { MagneticCard } from "@/components/better/magnetic-card"
import { StaticButton } from "@/components/better/static-button"
import { Paper } from "@/components/better/paper"
import { TypewriterText } from "@/components/better/typewriter-text"
import { NumberTicker } from "@/components/better/number-ticker"
import { Marquee } from "@/components/better/marquee"
import { Flipbook } from "@/components/better/flipbook"
import { SketchBorder } from "@/components/better/sketch-border"
import { MeshGradient } from "@/components/better/mesh-gradient"
import { NeuroNoise } from "@/components/better/neuro-noise"
import { Metaballs } from "@/components/better/metaballs"
import {
  IconTooltipDemo,
  IconWheelDemo,
  IconWheelPoster,
  InfiniteCanvasDemo,
  InfiniteCanvasPoster,
  ToastDemo,
  ToastPoster,
} from "@/components/better/icon-demos"

/** The GitHub repo that hosts the component source. */
export const REPO_URL = "https://github.com/bikash1376/better-components"

/** Prefix for deep links to a source file on the default branch. */
export const GITHUB_BASE = `${REPO_URL}/blob/main`

export const categories = [
  "Apps",
  "UI",
  "Typography",
  "Hand Drawn",
  "Shaders",
  "Loaders",
  "Carousel",
  "Mouse",
] as const

/** Categories that get a "New" badge in the gallery. */
export const newCategories: Category[] = ["Apps", "UI"]

/** The handful of avatar styles the gallery card shows off. */
const AVATAR_DEMO_STYLES: AvatarStyle[] = [
  "notionists",
  "lorelei",
  "pixel-art",
  "thumbs",
  "gradient",
]

export type Category = (typeof categories)[number]

export interface RegistryItem {
  slug: string
  name: string
  category: Category
  description: string
  /** Path (from project root) to the component source, used for the code modal + GitHub link. */
  sourcePath: string
  /** Minimal usage example shown in the code modal's Auto tab. */
  usage?: string
  /** Live preview (animated). */
  Demo: () => ReactNode
  /** Static resting state, shown in the gallery until hovered (no animation → no lag). */
  Poster: () => ReactNode
  /** Render the detail page full-screen with no command/title chrome (for apps). */
  fullBleed?: boolean
  /**
   * Never mount `Demo` in the gallery — show `Poster` even on hover. For heavy
   * apps whose demo hijacks the card (Animate opens its tour on mount).
   */
  staticPreview?: boolean
  /**
   * Temporarily kept in the registry (source + direct URL still resolve) but
   * hidden from the gallery, search, and sidebar listings.
   */
  hidden?: boolean
  /** Show the interactive controls playground on the detail page (see playground.tsx). */
  playground?: boolean
  /**
   * Rows prepended to the auto-generated props table for props the source
   * parser can't see — e.g. cva variants declared outside the Props interface.
   */
  extraProps?: PropRow[]
}

export const components: RegistryItem[] = [
  {
    slug: "text-shimmer",
    name: "Text Shimmer",
    category: "Typography",
    description: "An animated gradient sweep across text.",
    playground: true,
    sourcePath: "src/components/better/text-shimmer.tsx",
    usage: `import { TextShimmer } from "@/components/better/text-shimmer"

export function Example() {
  return (
    <TextShimmer className="text-3xl font-medium" duration={1.5} spread={2}>
      Better Components
    </TextShimmer>
  )
}`,
    Demo: () => (
      <TextShimmer className="text-3xl font-medium" duration={1.5}>
        Better Components
      </TextShimmer>
    ),
    Poster: () => (
      <span className="text-3xl font-medium text-muted-foreground">
        Better Components
      </span>
    ),
  },
  {
    slug: "stop-motion",
    name: "Stop Motion",
    category: "Hand Drawn",
    description: "Choppy, hand-animated stop-motion 'boil' for any content.",
    playground: true,
    sourcePath: "src/components/better/stop-motion.tsx",
    usage: `import { StopMotion } from "@/components/better/stop-motion"
import { SketchBorder } from "@/components/better/sketch-border"

export function Example() {
  return (
    <>
      {/* rotate/shift are the peak swing at either end of the boil. */}
      <StopMotion
        className="text-4xl font-semibold"
        fps={8}
        rotate={1.5}
        shift={1}
        steps={4}
      >
        Stop Motion
      </StopMotion>

      {/* Composes with SketchBorder — the boil wraps the hand-drawn box. */}
      <StopMotion fps={8} rotate={2}>
        <SketchBorder color="#6366f1" roughness={4} fps={8}>
          <span className="px-3 py-1 text-4xl font-semibold">Stop Motion</span>
        </SketchBorder>
      </StopMotion>
    </>
  )
}`,
    Demo: () => (
      <StopMotion className="text-4xl font-semibold">Stop Motion</StopMotion>
    ),
    Poster: () => (
      <span className="text-4xl font-semibold text-muted-foreground">
        Stop Motion
      </span>
    ),
  },
  {
    slug: "flipbook",
    name: "Flipbook",
    category: "Hand Drawn",
    description:
      "Snaps between frames — emoji, text, or square images — with no easing and no fades.",
    playground: true,
    sourcePath: "src/components/better/flipbook.tsx",
    usage: `import { Flipbook } from "@/components/better/flipbook"

export function Example() {
  return (
    <>
      {/* Text or emoji frames — one child per frame. */}
      <Flipbook fps={4} jitter>
        <span className="text-4xl">✊</span>
        <span className="text-4xl">✋</span>
        <span className="text-4xl">✌️</span>
      </Flipbook>

      {/* Image frames. Give every image the SAME width and height (a square
          source) — they're drawn into a square \`size\`×\`size\` box, so a
          mismatched aspect ratio gets cropped and the sequence wobbles. */}
      <Flipbook
        images={["/flipbook/ball-1.svg", "/flipbook/ball-2.svg", "/flipbook/ball-3.svg"]}
        alt="A bouncing ball"
        size={96}
        fps={6}
      />
    </>
  )
}`,
    Demo: () => (
      <Flipbook fps={4} className="text-5xl">
        <span>✊</span>
        <span>✋</span>
        <span>✌️</span>
      </Flipbook>
    ),
    Poster: () => <span className="text-5xl">✋</span>,
  },
  {
    slug: "sketch-border",
    name: "Sketch Border",
    category: "Hand Drawn",
    description: "A hand-drawn border that boils — redrawn a few times a second.",
    playground: true,
    sourcePath: "src/components/better/sketch-border.tsx",
    usage: `import { SketchBorder } from "@/components/better/sketch-border"

export function Example() {
  return (
    <SketchBorder color="#6366f1" strokeWidth={2} roughness={4} fps={4}>
      <span className="px-4 py-2 text-lg font-medium">Hand drawn</span>
    </SketchBorder>
  )
}`,
    Demo: () => (
      <SketchBorder color="#6366f1" strokeWidth={2}>
        <span className="px-4 py-2 text-lg font-medium">Hand drawn</span>
      </SketchBorder>
    ),
    Poster: () => (
      <span className="rounded-lg border-2 border-dashed border-muted-foreground/60 px-6 py-3 text-lg font-medium text-muted-foreground">
        Hand drawn
      </span>
    ),
  },
  {
    slug: "typewriter-text",
    name: "Typewriter Text",
    category: "Typography",
    hidden: true,
    description: "Words typed out character by character with a blinking caret.",
    sourcePath: "src/components/better/typewriter-text.tsx",
    usage: `import { TypewriterText } from "@/components/better/typewriter-text"

export function Example() {
  return (
    <span className="text-3xl font-medium">
      Build{" "}
      <TypewriterText
        words={["faster.", "better.", "in motion."]}
        typeSpeed={70}
        holdMs={1400}
        className="text-indigo-500"
      />
    </span>
  )
}`,
    Demo: () => (
      <span className="text-3xl font-medium">
        Build{" "}
        <TypewriterText
          words={["faster.", "better.", "in motion."]}
          className="text-indigo-500"
        />
      </span>
    ),
    Poster: () => (
      <span className="text-3xl font-medium">
        Build <span className="text-muted-foreground">better.|</span>
      </span>
    ),
  },
  {
    slug: "number-ticker",
    name: "Number Ticker",
    category: "Typography",
    description: "A number that springs up to its value when scrolled into view.",
    playground: true,
    sourcePath: "src/components/better/number-ticker.tsx",
    usage: `import { NumberTicker } from "@/components/better/number-ticker"

export function Example() {
  return (
    <NumberTicker
      value={12480}
      suffix="+"
      decimals={0}
      className="text-5xl font-semibold"
    />
  )
}`,
    Demo: () => (
      <NumberTicker value={12480} suffix="+" className="text-5xl font-semibold" />
    ),
    Poster: () => (
      <span className="text-5xl font-semibold text-muted-foreground">
        12,480+
      </span>
    ),
  },
  {
    slug: "dots-loader",
    name: "Dots Loader",
    category: "Loaders",
    description: "Three dots bouncing in sequence.",
    playground: true,
    sourcePath: "src/components/better/dots-loader.tsx",
    usage: `import { DotsLoader } from "@/components/better/dots-loader"

export function Example() {
  return <DotsLoader size={12} />
}`,
    Demo: () => <DotsLoader size={12} />,
    Poster: () => (
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-3 rounded-full bg-muted-foreground/50" />
        ))}
      </div>
    ),
  },
  {
    slug: "bar-loader",
    name: "Bar Loader",
    category: "Loaders",
    playground: true,
    description: "An equalizer of bars rising and falling in a wave.",
    sourcePath: "src/components/better/bar-loader.tsx",
    usage: `import { BarLoader } from "@/components/better/bar-loader"

export function Example() {
  return <BarLoader count={5} color="#6366f1" />
}`,
    Demo: () => <BarLoader color="#6366f1" />,
    Poster: () => (
      <div className="flex h-7 items-end gap-1">
        {[0.5, 1, 0.4, 0.8, 0.6].map((h, i) => (
          <span
            key={i}
            className="w-1 rounded-full bg-muted-foreground/50"
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </div>
    ),
  },
  {
    slug: "grid-pulse",
    name: "Grid Pulse",
    category: "Loaders",
    playground: true,
    description: "A dot-matrix grid pulsing in a diagonal wave.",
    sourcePath: "src/components/better/grid-pulse.tsx",
    usage: `import { GridPulse } from "@/components/better/grid-pulse"

export function Example() {
  return <GridPulse rows={3} cols={3} color="#6366f1" />
}`,
    Demo: () => <GridPulse color="#6366f1" />,
    Poster: () => (
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="size-2 rounded-full bg-muted-foreground/50" />
        ))}
      </div>
    ),
  },
  {
    slug: "ring-spinner",
    name: "Ring Spinner",
    category: "Loaders",
    playground: true,
    description: "A track ring with a rotating arc sweeping around it.",
    sourcePath: "src/components/better/ring-spinner.tsx",
    usage: `import { RingSpinner } from "@/components/better/ring-spinner"

export function Example() {
  return <RingSpinner size={40} color="#6366f1" />
}`,
    Demo: () => <RingSpinner color="#6366f1" />,
    Poster: () => (
      <div className="size-10 rounded-full border-4 border-muted-foreground/20 border-t-muted-foreground/60" />
    ),
  },
  {
    slug: "orbit-loader",
    name: "Orbit Loader",
    category: "Loaders",
    playground: true,
    description: "Dots circling a shared centre.",
    sourcePath: "src/components/better/orbit-loader.tsx",
    usage: `import { OrbitLoader } from "@/components/better/orbit-loader"

export function Example() {
  return <OrbitLoader size={40} count={3} color="#6366f1" />
}`,
    Demo: () => <OrbitLoader color="#6366f1" />,
    Poster: () => (
      <div className="relative size-10">
        {[0, 120, 240].map((deg) => (
          <span
            key={deg}
            className="absolute left-1/2 top-1/2 size-2 rounded-full bg-muted-foreground/50"
            style={{
              transform: `rotate(${deg}deg) translateX(16px)`,
            }}
          />
        ))}
      </div>
    ),
  },
  {
    slug: "mesh-gradient",
    name: "Mesh Gradient",
    category: "Shaders",
    hidden: true,
    description: "A flowing multi-color gradient rendered on the GPU (paper.design).",
    sourcePath: "src/components/better/mesh-gradient.tsx",
    usage: `import { MeshGradient } from "@/components/better/mesh-gradient"

export function Example() {
  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl">
      <MeshGradient
        colors={["#5b21b6", "#1d4ed8", "#0ea5e9", "#e879f9"]}
        speed={0.6}
        distortion={0.8}
      />
    </div>
  )
}`,
    Demo: () => (
      <div className="h-56 w-80 overflow-hidden rounded-2xl">
        <MeshGradient />
      </div>
    ),
    Poster: () => (
      <div className="h-56 w-80 rounded-2xl bg-gradient-to-br from-violet-800 via-blue-700 to-fuchsia-400" />
    ),
  },
  {
    slug: "neuro-noise",
    name: "Neuro Noise",
    category: "Shaders",
    hidden: true,
    description: "A glowing web of fluid lines on the GPU (paper.design).",
    sourcePath: "src/components/better/neuro-noise.tsx",
    usage: `import { NeuroNoise } from "@/components/better/neuro-noise"

export function Example() {
  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl">
      <NeuroNoise colorFront="#c4b5fd" colorBack="#030712" speed={0.5} />
    </div>
  )
}`,
    Demo: () => (
      <div className="h-56 w-80 overflow-hidden rounded-2xl">
        <NeuroNoise />
      </div>
    ),
    Poster: () => (
      <div className="h-56 w-80 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,#4c1d95,#030712_70%)]" />
    ),
  },
  {
    slug: "metaballs",
    name: "Metaballs",
    category: "Shaders",
    hidden: true,
    description: "Gooey blobs merging into organic shapes on the GPU (paper.design).",
    sourcePath: "src/components/better/metaballs.tsx",
    usage: `import { Metaballs } from "@/components/better/metaballs"

export function Example() {
  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl">
      <Metaballs colors={["#f43f5e", "#fb923c", "#facc15"]} count={8} />
    </div>
  )
}`,
    Demo: () => (
      <div className="h-56 w-80 overflow-hidden rounded-2xl">
        <Metaballs />
      </div>
    ),
    Poster: () => (
      <div className="h-56 w-80 rounded-2xl bg-[radial-gradient(circle_at_45%_55%,#fb923c_0%,#f43f5e_35%,#030712_75%)]" />
    ),
  },
  {
    slug: "marquee",
    name: "Marquee",
    category: "Carousel",
    description: "An infinite, seamless horizontal scroller with edge fading.",
    playground: true,
    sourcePath: "src/components/better/marquee.tsx",
    usage: `import { Marquee } from "@/components/better/marquee"

export function Example() {
  return (
    <Marquee duration={12} hover="pause">
      <span>Motion</span>
      <span>Design</span>
      <span>Animate</span>
    </Marquee>
  )
}`,
    Demo: () => (
      <Marquee className="w-80" duration={12}>
        {["Motion", "Design", "Animate", "Export", "Create"].map((t) => (
          <span
            key={t}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium"
          >
            {t}
          </span>
        ))}
      </Marquee>
    ),
    Poster: () => (
      <div className="flex w-80 gap-3 overflow-hidden">
        {["Motion", "Design", "Animate"].map((t) => (
          <span
            key={t}
            className="whitespace-nowrap rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    ),
  },
  {
    slug: "magnetic-button",
    name: "Magnetic Button",
    category: "Mouse",
    description: "A button that pulls toward the cursor on hover.",
    playground: true,
    sourcePath: "src/components/better/magnetic-button.tsx",
    usage: `import { MagneticButton } from "@/components/better/magnetic-button"

export function Example() {
  return <MagneticButton>Hover me</MagneticButton>
}`,
    Demo: () => <MagneticButton>Hover me</MagneticButton>,
    Poster: () => (
      <span className="rounded-full bg-muted-foreground/50 px-6 py-2.5 text-sm font-medium text-background">
        Hover me
      </span>
    ),
  },
  {
    slug: "magnetic-card",
    name: "Magnetic Card",
    category: "Mouse",
    playground: true,
    description: "A card that tilts in 3D toward the cursor, with a moving glare.",
    sourcePath: "src/components/better/magnetic-card.tsx",
    usage: `import { MagneticCard } from "@/components/better/magnetic-card"

export function Example() {
  return (
    <MagneticCard className="w-64">
      <h3 className="text-lg font-medium">Magnetic</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Tilts toward your cursor.
      </p>
    </MagneticCard>
  )
}`,
    Demo: () => (
      <MagneticCard className="w-60">
        <h3 className="text-lg font-medium">Magnetic Card</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Move your cursor across me.
        </p>
      </MagneticCard>
    ),
    Poster: () => (
      <div className="w-60 rounded-2xl border border-border bg-card p-6 shadow-lg">
        <h3 className="text-lg font-medium text-muted-foreground">
          Magnetic Card
        </h3>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Move your cursor across me.
        </p>
      </div>
    ),
  },
  {
    slug: "icon-tooltip",
    name: "Icon Tooltip",
    category: "Mouse",
    playground: true,
    description:
      "An icon button that reveals a tooltip — choose the side and delay.",
    sourcePath: "src/components/better/icon-tooltip.tsx",
    usage: `import { IconTooltip } from "@/components/better/icon-tooltip"
import { StarIcon } from "@phosphor-icons/react"

export function Example() {
  return (
    <IconTooltip
      icon={<StarIcon className="size-5" />}
      label="Favorite"
      side="top"
      delay={150}
    />
  )
}`,
    Demo: IconTooltipDemo,
    Poster: IconTooltipDemo,
  },
  {
    slug: "toast",
    name: "Toast",
    category: "UI",
    description:
      "A toast system: imperative toast(), spring stacking, swipe-to-dismiss, types.",
    sourcePath: "src/components/better/toast.tsx",
    usage: `import { Toaster, toast } from "@/components/better/toast"

export function Example() {
  return (
    <>
      {/* Mount <Toaster /> once near your app root. */}
      <Toaster position="bottom-right" />
      <button onClick={() => toast.success("Saved", { description: "All good." })}>
        Show toast
      </button>
    </>
  )
}`,
    Demo: ToastDemo,
    Poster: ToastPoster,
  },
  {
    slug: "icon-wheel",
    name: "Icon Wheel",
    category: "Mouse",
    hidden: true,
    description: "A ring of icons that rotates as you scroll while hovered.",
    sourcePath: "src/components/better/icon-wheel.tsx",
    usage: `import { IconWheel } from "@/components/better/icon-wheel"

export function Example() {
  return <IconWheel />
}`,
    Demo: IconWheelDemo,
    Poster: IconWheelPoster,
  },
  {
    slug: "animate",
    name: "Animate",
    category: "Apps",
    fullBleed: true,
    staticPreview: true,
    description:
      "A motion design editor: shapes, effects, undo/zoom, dual frame/time timeline, AI generation, video export.",
    sourcePath: "src/components/better/animate/animate.tsx",
    usage: `import { Animate } from "@/components/better/animate"

export function Example() {
  // Fills its parent; pair with an /api/animate route for AI generation.
  return (
    <div className="h-svh p-3">
      <Animate aiEndpoint="/api/animate" />
    </div>
  )
}`,
    Demo: () => <Animate />,
    // A still of the editor, never the editor itself — mounting it in a gallery
    // card would pop the onboarding tour the moment you hovered the card.
    Poster: () => (
      <Image
        src="/animate-thumbnail.png"
        alt="The Animate editor: canvas, shape tools, and a frame timeline"
        width={1918}
        height={1075}
        className="h-full w-auto rounded-lg border border-border object-contain"
      />
    ),
  },
  {
    slug: "static-button",
    name: "Static Button",
    category: "UI",
    playground: true,
    description:
      "A clean, Apple-style pill button — variants and sizes, pure CSS, no motion.",
    sourcePath: "src/components/better/static-button.tsx",
    // variant/size live in the cva() call, invisible to the props parser.
    extraProps: [
      {
        name: "variant",
        type: `"primary" | "secondary" | "outline" | "ghost" | "gradient"`,
        required: false,
        default: `"primary"`,
        description: "Visual style of the pill.",
      },
      {
        name: "size",
        type: `"sm" | "md" | "lg"`,
        required: false,
        default: `"md"`,
        description: "Padding and text size.",
      },
    ],
    usage: `import { StaticButton } from "@/components/better/static-button"

export function Example() {
  return (
    <div className="flex gap-3">
      <StaticButton>Buy</StaticButton>
      <StaticButton variant="secondary">Learn more</StaticButton>

      {/* The gradient variant takes its own colours and angle. */}
      <StaticButton
        variant="gradient"
        gradientColors={["#6366f1", "#8b5cf6", "#ec4899"]}
        gradientAngle={120}
      >
        Upgrade
      </StaticButton>
    </div>
  )
}`,
    Demo: () => (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <StaticButton>Buy</StaticButton>
        <StaticButton variant="secondary">Learn more</StaticButton>
        <StaticButton variant="outline">Outline</StaticButton>
      </div>
    ),
    Poster: () => (
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-[#0071e3] px-[17px] py-2.5 text-[15px] font-medium text-white">
          Buy
        </span>
        <span className="rounded-full bg-[#f5f5f7] px-[17px] py-2.5 text-[15px] font-medium text-[#1d1d1f]">
          Learn more
        </span>
      </div>
    ),
  },
  {
    slug: "infinite-canvas",
    name: "Infinite Canvas",
    category: "UI",
    playground: true,
    description:
      "A pannable, endless grid of any tiles you like — only on-screen cells mount.",
    sourcePath: "src/components/better/infinite-canvas.tsx",
    usage: `import { InfiniteCanvas } from "@/components/better/infinite-canvas"
import { HouseIcon, HeartIcon, StarIcon, BellIcon } from "@phosphor-icons/react"

// \`items\` is any ReactNode[] — icons, <img>, avatars, text, whole cards.
// Each cell hashes its coordinates to pick one, so a cell always shows the
// same tile and neighbours differ. Pass 1 item or 100: the grid is endless
// either way, the items just repeat.

export function Example() {
  const icons = [HouseIcon, HeartIcon, StarIcon, BellIcon]
  return (
    <InfiniteCanvas
      className="h-80 w-full"
      cellSize={88}   // grid spacing
      tileSize={56}   // the tile drawn inside each cell
      overscan={1}    // cells pre-mounted off-screen: no pop-in while dragging
      items={icons.map((Icon, i) => (
        <Icon key={i} className="size-6" />
      ))}
    />
  )
}`,
    Demo: InfiniteCanvasDemo,
    Poster: InfiniteCanvasPoster,
  },
  {
    slug: "paper",
    name: "Paper",
    category: "UI",
    playground: true,
    description:
      "A GPU paper surface — fibres, crumples, folds, and grain. Run it over a photo, or on its own.",
    sourcePath: "src/components/better/paper.tsx",
    usage: `import { Paper } from "@/components/better/paper"

export function Example() {
  return (
    <>
      {/* A plain paper surface. */}
      <Paper folds={0.65} crumples={0.3} fiber={0.3} className="h-48 w-72 p-6">
        <span className="text-neutral-800">Paper</span>
      </Paper>

      {/* Or run the texture over a photo — creased, printed-on-paper look. */}
      <Paper image="/photo.jpg" folds={0.8} className="h-48 w-72" />
    </>
  )
}`,
    Demo: () => (
      <Paper
        image="/hero_image.jpg"
        folds={0.7}
        crumples={0.35}
        className="h-44 w-64"
      />
    ),
    Poster: () => (
      <div className="flex h-44 w-64 items-center justify-center rounded-2xl bg-[#f4efe4] shadow-lg">
        <span className="text-xl font-medium text-neutral-800">Paper</span>
      </div>
    ),
  },
  {
    slug: "avatar",
    name: "Avatar",
    category: "UI",
    playground: true,
    description:
      "Deterministic avatars from any seed — DiceBear CC0 art styles or an abstract shader gradient.",
    sourcePath: "src/components/better/avatar.tsx",
    usage: `import { Avatar, AvatarPicker } from "@/components/better/avatar"

// npm i @dicebear/core @dicebear/collection
// DiceBear's code is MIT; only its CC0 (public-domain) styles are exposed
// here, so no attribution is owed. "gradient" is a paper.design shader.

export function Example() {
  return (
    <div className="flex items-center gap-6">
      {/* Same seed always renders the same avatar. */}
      <Avatar seed="bikash" style="notionists" size={64} />
      <Avatar seed="bikash" style="gradient" size={64} />

      {/* Let someone pick their own — onChange gives you { seed, style }. */}
      <AvatarPicker
        defaultStyle="gradient"
        onChange={(value) => console.log(value)}
      />
    </div>
  )
}`,
    Demo: () => (
      <div className="flex items-center gap-3">
        {AVATAR_DEMO_STYLES.map((s) => (
          <Avatar key={s} seed="bettercomp" style={s} size={52} speed={0.4} />
        ))}
      </div>
    ),
    Poster: () => (
      <div className="flex items-center gap-3">
        {AVATAR_DEMO_STYLES.map((s) => (
          <Avatar key={s} seed="bettercomp" style={s} size={52} />
        ))}
      </div>
    ),
  },
]

export function getComponent(slug: string): RegistryItem | undefined {
  return components.find((c) => c.slug === slug)
}

/** Everything the site lists — the registry minus any temporarily hidden items. */
export const visibleComponents = components.filter((c) => !c.hidden)

export function componentsByCategory() {
  return categories
    .map((category) => ({
      category,
      items: visibleComponents.filter((c) => c.category === category),
    }))
    .filter((group) => group.items.length > 0)
}
