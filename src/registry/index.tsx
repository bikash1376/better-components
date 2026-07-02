import type { ReactNode } from "react"

import { TextShimmer } from "@/components/better/text-shimmer"
import { StopMotion } from "@/components/better/stop-motion"
import { Animate } from "@/components/better/animate"
import { DotsLoader } from "@/components/better/dots-loader"
import { MagneticButton } from "@/components/better/magnetic-button"
import { MagneticCard } from "@/components/better/magnetic-card"
import { StaticButton } from "@/components/better/static-button"
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
    description: "An icon button that reveals a tooltip on hover.",
    sourcePath: "src/components/better/icon-tooltip.tsx",
    install: "npx shadcn@latest add @bettercomp/icon-tooltip",
    usage: `import { IconTooltip } from "@/components/better/icon-tooltip"
import { Star } from "lucide-react"

export function Example() {
  return (
    <IconTooltip label="Favorite">
      <Star className="size-5" />
    </IconTooltip>
  )
}`,
    Demo: IconTooltipDemo,
    Poster: IconTooltipDemo,
  },
  {
    slug: "notification-card",
    name: "Notification Card",
    category: "Mouse",
    description: "A toast-style notification with a leading icon.",
    sourcePath: "src/components/better/notification-card.tsx",
    install: "npx shadcn@latest add @bettercomp/notification-card",
    usage: `import { NotificationCard } from "@/components/better/notification-card"

export function Example() {
  return (
    <NotificationCard
      title="Payment received"
      description="Invoice #1042 · just now"
    />
  )
}`,
    Demo: NotificationDemo,
    Poster: NotificationDemo,
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
      "An iPhone-style pill that fluidly resizes and morphs between states.",
    sourcePath: "src/components/better/dynamic-island.tsx",
    install: "npx shadcn@latest add @bettercomp/dynamic-island",
    usage: `import { useState } from "react"
import { DynamicIsland } from "@/components/better/dynamic-island"

export function Example() {
  const [open, setOpen] = useState(false)
  return (
    <DynamicIsland
      state={open ? "open" : "idle"}
      onClick={() => setOpen((v) => !v)}
      className="px-4 py-2.5"
    >
      {open ? (
        <span className="px-2 text-sm font-medium">Now Playing — Aura</span>
      ) : (
        <span className="size-2 rounded-full bg-white/40" />
      )}
    </DynamicIsland>
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
