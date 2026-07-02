import type { ReactNode } from "react"

import { TextShimmer } from "@/components/better/text-shimmer"
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
  DynamicIslandDemo,
  DynamicIslandPoster,
  IconTooltipDemo,
  IconWheelDemo,
  IconWheelPoster,
  InfiniteCanvasDemo,
  InfiniteCanvasPoster,
  NotificationDemo,
  ToastDemo,
  ToastPoster,
} from "@/components/better/icon-demos"

/** Base URL of the GitHub repo that hosts the component source. Dummy for now. */
export const GITHUB_BASE =
  "https://github.com/your-org/better-components/blob/main"

export const categories = [
  "Apps",
  "UI",
  "Typography",
  "Stop Motion",
  "Shaders",
  "Loaders",
  "Carousel",
  "Mouse",
] as const

/** Categories that get a "New" badge in the gallery. */
export const newCategories: Category[] = ["Apps", "UI"]

export type Category = (typeof categories)[number]

export interface RegistryItem {
  slug: string
  name: string
  category: Category
  description: string
  /** Path (from project root) to the component source, used for the code modal + GitHub link. */
  sourcePath: string
  /** Dummy install command shown on the component page. */
  install: string
  /** Minimal usage example shown in the code modal's Auto tab. */
  usage?: string
  /** Live preview (animated). */
  Demo: () => ReactNode
  /** Static resting state, shown in the gallery until hovered (no animation → no lag). */
  Poster: () => ReactNode
  /** Render the detail page full-screen with no command/title chrome (for apps). */
  fullBleed?: boolean
  /**
   * Temporarily kept in the registry (source + direct URL still resolve) but
   * hidden from the gallery, search, and sidebar listings.
   */
  hidden?: boolean
  /** Show the interactive controls playground on the detail page (see playground.tsx). */
  playground?: boolean
}

export const components: RegistryItem[] = [
  {
    slug: "text-shimmer",
    name: "Text Shimmer",
    category: "Typography",
    description: "An animated gradient sweep across text.",
    playground: true,
    sourcePath: "src/components/better/text-shimmer.tsx",
    install: "npx shadcn@latest add @bettercomp/text-shimmer",
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
    category: "Stop Motion",
    description: "Choppy, hand-animated stop-motion 'boil' for any content.",
    playground: true,
    sourcePath: "src/components/better/stop-motion.tsx",
    install: "npx shadcn@latest add @bettercomp/stop-motion",
    usage: `import { StopMotion } from "@/components/better/stop-motion"

export function Example() {
  return (
    <StopMotion className="text-4xl font-semibold">Stop Motion</StopMotion>
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
    category: "Stop Motion",
    description: "Snaps between children like flipbook pages — no easing, no fades.",
    playground: true,
    sourcePath: "src/components/better/flipbook.tsx",
    install: "npx shadcn@latest add @bettercomp/flipbook",
    usage: `import { Flipbook } from "@/components/better/flipbook"

export function Example() {
  return (
    <Flipbook fps={4} jitter>
      <span className="text-4xl">✊</span>
      <span className="text-4xl">✋</span>
      <span className="text-4xl">✌️</span>
    </Flipbook>
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
    category: "Stop Motion",
    description: "A hand-drawn border that boils — redrawn a few times a second.",
    playground: true,
    sourcePath: "src/components/better/sketch-border.tsx",
    install: "npx shadcn@latest add @bettercomp/sketch-border",
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
    install: "npx shadcn@latest add @bettercomp/typewriter-text",
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
    install: "npx shadcn@latest add @bettercomp/number-ticker",
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
    install: "npx shadcn@latest add @bettercomp/dots-loader",
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
    install: "npx shadcn@latest add @bettercomp/bar-loader",
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
    install: "npx shadcn@latest add @bettercomp/grid-pulse",
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
    install: "npx shadcn@latest add @bettercomp/ring-spinner",
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
    install: "npx shadcn@latest add @bettercomp/orbit-loader",
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
    install: "npx shadcn@latest add @bettercomp/mesh-gradient",
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
    install: "npx shadcn@latest add @bettercomp/neuro-noise",
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
    install: "npx shadcn@latest add @bettercomp/metaballs",
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
    install: "npx shadcn@latest add @bettercomp/marquee",
    usage: `import { Marquee } from "@/components/better/marquee"

export function Example() {
  return (
    <Marquee duration={12} pauseOnHover>
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
    install: "npx shadcn@latest add @bettercomp/magnetic-button",
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
    install: "npx shadcn@latest add @bettercomp/magnetic-card",
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
    install: "npx shadcn@latest add @bettercomp/icon-tooltip",
    usage: `import { IconTooltip } from "@/components/better/icon-tooltip"
import { Star } from "lucide-react"

export function Example() {
  return (
    <IconTooltip
      icon={<Star className="size-5" />}
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
    slug: "notification-card",
    name: "Notification Card",
    category: "Mouse",
    playground: true,
    description:
      "A springy, physics-flavoured toast with an accent icon and action.",
    sourcePath: "src/components/better/notification-card.tsx",
    install: "npx shadcn@latest add @bettercomp/notification-card",
    usage: `import { NotificationCard } from "@/components/better/notification-card"
import { Star, X } from "lucide-react"

export function Example() {
  return (
    <NotificationCard
      icon={<Star className="size-4" />}
      title="New star"
      message="Someone starred your component."
      time="now"
      accent="amber"
      action={{ label: "View repo" }}
      closeIcon={<X className="size-4" />}
    />
  )
}`,
    Demo: NotificationDemo,
    Poster: NotificationDemo,
  },
  {
    slug: "toast",
    name: "Toast",
    category: "Mouse",
    description:
      "A toast system: imperative toast(), spring stacking, swipe-to-dismiss, types.",
    sourcePath: "src/components/better/toast.tsx",
    install: "npx shadcn@latest add @bettercomp/toast",
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
    install: "npx shadcn@latest add @bettercomp/icon-wheel",
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
    description:
      "A motion design editor: shapes, effects, undo/zoom, dual frame/time timeline, AI generation, video export.",
    sourcePath: "src/components/better/animate/animate.tsx",
    install: "npx shadcn@latest add @bettercomp/animate",
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
    Poster: () => (
      <div className="flex w-56 flex-col gap-1.5 rounded-lg border border-border bg-card p-2">
        <div className="flex gap-1">
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
        </div>
        <div className="relative h-16 rounded bg-muted/40">
          <span className="absolute left-3 top-3 size-5 rounded bg-indigo-500" />
          <span className="absolute left-12 top-5 size-6 rounded-full bg-rose-500" />
          <span className="absolute right-4 top-2 size-0 border-x-8 border-b-[14px] border-x-transparent border-b-emerald-500" />
        </div>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-4 flex-1 rounded-sm border border-border bg-background"
            />
          ))}
        </div>
      </div>
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
    install: "npx shadcn@latest add @bettercomp/static-button",
    usage: `import { StaticButton } from "@/components/better/static-button"

export function Example() {
  return (
    <div className="flex gap-3">
      <StaticButton>Buy</StaticButton>
      <StaticButton variant="secondary">Learn more</StaticButton>
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
    slug: "dynamic-island",
    name: "Dynamic Island",
    category: "UI",
    playground: true,
    description:
      "An iPhone-style pill that taps open from a compact pill into a card.",
    sourcePath: "src/components/better/dynamic-island.tsx",
    install: "npx shadcn@latest add @bettercomp/dynamic-island",
    usage: `import { DynamicIsland } from "@/components/better/dynamic-island"
import { Phone, PhoneDisconnect } from "@phosphor-icons/react"

export function Example() {
  // Click the pill to expand into the card; pass your own compact/expanded.
  return (
    <DynamicIsland
      compact={<span className="px-1 text-sm font-medium">Aanya</span>}
      expanded={
        <div className="flex w-60 gap-2">
          <button className="flex-1 rounded-full bg-red-500 py-2 text-sm">
            Decline
          </button>
          <button className="flex-1 rounded-full bg-green-500 py-2 text-sm">
            Accept
          </button>
        </div>
      }
    />
  )
}`,
    Demo: DynamicIslandDemo,
    Poster: DynamicIslandPoster,
  },
  {
    slug: "infinite-canvas",
    name: "Infinite Canvas",
    category: "UI",
    playground: true,
    description:
      "A pannable, endless grid — only on-screen tiles mount, popping in as you drag.",
    sourcePath: "src/components/better/infinite-canvas.tsx",
    install: "npx shadcn@latest add @bettercomp/infinite-canvas",
    usage: `import { InfiniteCanvas } from "@/components/better/infinite-canvas"
import { Home, Heart, Star, Bell, User, Mail } from "lucide-react"

export function Example() {
  const icons = [Home, Heart, Star, Bell, User, Mail]
  return (
    <InfiniteCanvas
      className="h-80 w-full"
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
      "A textured paper surface — fractal-noise grain, soft light, and emboss.",
    sourcePath: "src/components/better/paper.tsx",
    install: "npx shadcn@latest add @bettercomp/paper",
    usage: `import { Paper } from "@/components/better/paper"

export function Example() {
  return (
    <Paper grain={0.4} fibers={0.25} edge="torn" className="h-48 w-72">
      <div className="p-6 text-neutral-800">Paper</div>
    </Paper>
  )
}`,
    Demo: () => (
      <Paper
        grain={0.4}
        fibers={0.25}
        strength={0.6}
        className="flex h-44 w-64 items-center justify-center"
      >
        <span className="text-xl font-medium text-neutral-800">Paper</span>
      </Paper>
    ),
    Poster: () => (
      <div className="flex h-44 w-64 items-center justify-center rounded-2xl bg-[#f4efe4] shadow-lg">
        <span className="text-xl font-medium text-neutral-800">Paper</span>
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
