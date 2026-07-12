"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  BellIcon,
  CaretDownIcon,
  CodeIcon,
  EnvelopeIcon,
  GearIcon,
  HeartIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  StarIcon,
  UploadSimpleIcon,
  UserIcon,
  XIcon,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { CodeBlock } from "@/components/site/code-block"
import { Avatar, AVATAR_STYLES } from "@/components/better/avatar"
import { StaticButton } from "@/components/better/static-button"
import { MagneticCard } from "@/components/better/magnetic-card"
import { MagneticButton } from "@/components/better/magnetic-button"
import { InfiniteCanvas } from "@/components/better/infinite-canvas"
import { TextShimmer } from "@/components/better/text-shimmer"
import { StopMotion } from "@/components/better/stop-motion"
import { Flipbook } from "@/components/better/flipbook"
import { SketchBorder } from "@/components/better/sketch-border"
import { NumberTicker } from "@/components/better/number-ticker"
import { DotsLoader } from "@/components/better/dots-loader"
import { BarLoader } from "@/components/better/bar-loader"
import { GridPulse } from "@/components/better/grid-pulse"
import { RingSpinner } from "@/components/better/ring-spinner"
import { OrbitLoader } from "@/components/better/orbit-loader"
import { Marquee } from "@/components/better/marquee"
import { IconTooltip } from "@/components/better/icon-tooltip"
import { Paper } from "@/components/better/paper"

/* ----------------------------------------------------------------- */
/* Control schema                                                     */
/* ----------------------------------------------------------------- */

type Value = string | number | boolean | string[]
export type Values = Record<string, Value>

type ControlKind =
  | {
      type: "select"
      prop: string
      label: string
      options: { label: string; value: string }[]
      default: string
    }
  | {
      type: "number"
      prop: string
      label: string
      min: number
      max: number
      step?: number
      default: number
      hint?: string
    }
  | { type: "boolean"; prop: string; label: string; default: boolean }
  | { type: "text"; prop: string; label: string; default: string }
  | { type: "color"; prop: string; label: string; default: string }
  /** Upload a single image; `default` is the src shown until one is picked. */
  | { type: "image"; prop: string; label: string; default: string }
  /** Upload a sequence of images (a flipbook needs at least a few). */
  | {
      type: "images"
      prop: string
      label: string
      min: number
      max: number
      default: string[]
      hint?: string
    }

/** `showIf` hides a control until another control makes it relevant. */
type Control = ControlKind & { showIf?: (v: Values) => boolean }

interface PlaygroundConfig {
  controls: Control[]
  render: (v: Values) => ReactNode
  code: (v: Values) => string
  /** Shown above the controls — how the component works, what it accepts. */
  note?: string
}

/* ----------------------------------------------------------------- */
/* Previews that need a little wiring live as their own components     */
/* ----------------------------------------------------------------- */

const CANVAS_ICONS = [
  HouseIcon,
  UserIcon,
  BellIcon,
  HeartIcon,
  StarIcon,
  GearIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  CodeIcon,
]

const CANVAS_WORDS = [
  "Motion",
  "Design",
  "Grid",
  "Pan",
  "Tile",
  "Loop",
  "Drag",
  "Endless",
  "Canvas",
]
const CANVAS_SEEDS = ["ada", "brio", "cove", "dusk", "ember", "flux", "gale", "halo", "iris"]
const CANVAS_IMAGES = [
  "/flipbook/ball-1.svg",
  "/flipbook/ball-2.svg",
  "/flipbook/ball-3.svg",
  "/hero_image.jpg",
  "/animate-thumbnail.png",
]

/**
 * Builds the tile pool. Any ReactNode works as a tile — this just demonstrates
 * four kinds so the canvas's flexibility isn't left to the imagination.
 */
function canvasItems(content: string, count: number): ReactNode[] {
  if (content === "avatars") {
    return CANVAS_SEEDS.slice(0, count).map((seed) => (
      <Avatar key={seed} seed={seed} style="notionists" size={40} />
    ))
  }
  if (content === "text") {
    return CANVAS_WORDS.slice(0, count).map((word) => (
      <span key={word} className="text-xs font-medium">
        {word}
      </span>
    ))
  }
  if (content === "images") {
    return CANVAS_IMAGES.slice(0, count).map((src) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img key={src} src={src} alt="" className="size-full object-cover" />
    ))
  }
  return CANVAS_ICONS.slice(0, count).map((Icon, i) => (
    <Icon key={i} className="size-6" />
  ))
}

/** The three sample frames shipped in `public/flipbook/`. */
const BALL_FRAMES = [
  "/flipbook/ball-1.svg",
  "/flipbook/ball-2.svg",
  "/flipbook/ball-3.svg",
]

/** Fewer than 3 frames isn't a flipbook; past 12 the cycle is a slideshow. */
const FLIPBOOK_MIN_FRAMES = 3
const FLIPBOOK_MAX_FRAMES = 12

/** Under 3 the loop looks sparse; past 12 the strip is just long. */
const MARQUEE_MIN_IMAGES = 3
const MARQUEE_MAX_IMAGES = 12

/* ----------------------------------------------------------------- */
/* Per-component playground configs                                   */
/* ----------------------------------------------------------------- */

export const PLAYGROUNDS: Record<string, PlaygroundConfig> = {
  "static-button": {
    controls: [
      {
        type: "select",
        prop: "variant",
        label: "Variant",
        default: "primary",
        options: [
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Outline", value: "outline" },
          { label: "Ghost", value: "ghost" },
          { label: "Gradient", value: "gradient" },
        ],
      },
      {
        type: "select",
        prop: "size",
        label: "Size",
        default: "md",
        options: [
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
        ],
      },
      { type: "text", prop: "label", label: "Label", default: "Buy" },
      { type: "number", prop: "radius", label: "Radius", min: 0, max: 40, default: 40, hint: "px" },
      { type: "boolean", prop: "disabled", label: "Disabled", default: false },
      // The gradient's own knobs — only meaningful on that variant.
      {
        type: "color",
        prop: "gradient1",
        label: "Stop 1",
        default: "#6366f1",
        showIf: (v) => v.variant === "gradient",
      },
      {
        type: "color",
        prop: "gradient2",
        label: "Stop 2",
        default: "#8b5cf6",
        showIf: (v) => v.variant === "gradient",
      },
      {
        type: "color",
        prop: "gradient3",
        label: "Stop 3",
        default: "#ec4899",
        showIf: (v) => v.variant === "gradient",
      },
      {
        type: "number",
        prop: "gradientAngle",
        label: "Angle",
        min: 0,
        max: 360,
        step: 5,
        default: 120,
        hint: "deg",
        showIf: (v) => v.variant === "gradient",
      },
    ],
    render: (v) => (
      <StaticButton
        variant={v.variant as "primary" | "secondary" | "outline" | "ghost" | "gradient"}
        size={v.size as "sm" | "md" | "lg"}
        radius={v.radius as number}
        disabled={v.disabled as boolean}
        gradientColors={[
          String(v.gradient1),
          String(v.gradient2),
          String(v.gradient3),
        ]}
        gradientAngle={v.gradientAngle as number}
      >
        {String(v.label)}
      </StaticButton>
    ),
    code: (v) =>
      `import { StaticButton } from "@/components/better/static-button"

export function Example() {
  return (
    <StaticButton
      variant="${v.variant}"
      size="${v.size}"
      radius={${v.radius}}${v.disabled ? "\n      disabled" : ""}${
        v.variant === "gradient"
          ? `\n      gradientColors={["${v.gradient1}", "${v.gradient2}", "${v.gradient3}"]}\n      gradientAngle={${v.gradientAngle}}`
          : ""
      }
    >
      ${v.label}
    </StaticButton>
  )
}`,
  },

  "magnetic-card": {
    controls: [
      { type: "text", prop: "title", label: "Title", default: "Magnetic Card" },
      { type: "text", prop: "subtitle", label: "Subtitle", default: "Move your cursor across me." },
      { type: "boolean", prop: "image", label: "Image", default: false },
      { type: "number", prop: "tilt", label: "Tilt", min: 0, max: 30, default: 12, hint: "deg" },
      { type: "number", prop: "drift", label: "Drift", min: 0, max: 40, default: 10, hint: "px" },
      { type: "boolean", prop: "glare", label: "Glare", default: true },
    ],
    render: (v) => (
      <MagneticCard
        tilt={v.tilt as number}
        drift={v.drift as number}
        glare={v.glare as boolean}
        title={String(v.title)}
        subtitle={String(v.subtitle)}
        image={v.image ? "/hero_image.jpg" : undefined}
        className="w-64"
      />
    ),
    code: (v) =>
      `import { MagneticCard } from "@/components/better/magnetic-card"

export function Example() {
  return (
    <MagneticCard
      tilt={${v.tilt}}
      drift={${v.drift}}
      glare={${v.glare}}${v.image ? `\n      image="/photo.jpg"` : ""}
      title="${v.title}"
      subtitle="${v.subtitle}"
      className="w-64"
    />
  )
}`,
  },

  "magnetic-button": {
    controls: [
      { type: "number", prop: "strength", label: "Strength", min: 0, max: 1, step: 0.05, default: 0.4 },
    ],
    render: (v) => (
      <MagneticButton strength={v.strength as number}>Hover me</MagneticButton>
    ),
    code: (v) =>
      `import { MagneticButton } from "@/components/better/magnetic-button"

export function Example() {
  return <MagneticButton strength={${v.strength}}>Hover me</MagneticButton>
}`,
  },

  "infinite-canvas": {
    // `items` is just ReactNode[] — the tiles can be anything. The Content
    // control shows that off rather than leaving people to guess.
    note: "Drag to pan — the grid never ends. `items` is any ReactNode[] (icons, images, avatars, text…); each cell hashes its coordinates to pick one, so the same cell always shows the same tile. Pass 1 item or 100 — the grid is endless either way, the items just repeat.",
    controls: [
      {
        type: "select",
        prop: "content",
        label: "Content",
        default: "icons",
        options: [
          { label: "Icons", value: "icons" },
          { label: "Avatars", value: "avatars" },
          { label: "Text", value: "text" },
          { label: "Images", value: "images" },
        ],
      },
      { type: "number", prop: "count", label: "Items", min: 1, max: 9, default: 9, hint: "in the pool" },
      { type: "number", prop: "cellSize", label: "Cell size", min: 60, max: 160, default: 88, hint: "px" },
      { type: "number", prop: "tileSize", label: "Tile size", min: 24, max: 120, step: 2, default: 56, hint: "px" },
      // Pre-mounts cells outside the viewport: nothing changes while you sit
      // still, it only removes pop-in at the edges as you drag.
      { type: "number", prop: "overscan", label: "Overscan", min: 0, max: 3, default: 1, hint: "drag-only" },
    ],
    render: (v) => (
      <InfiniteCanvas
        items={canvasItems(String(v.content), v.count as number)}
        cellSize={v.cellSize as number}
        tileSize={v.tileSize as number}
        overscan={v.overscan as number}
        className="h-64 w-full"
      />
    ),
    code: (v) =>
      `import { InfiniteCanvas } from "@/components/better/infinite-canvas"
import { HouseIcon, UserIcon, BellIcon, HeartIcon, StarIcon } from "@phosphor-icons/react"

// items is ReactNode[] — swap these for <img>, <Avatar>, text, whole cards.
const icons = [HouseIcon, UserIcon, BellIcon, HeartIcon, StarIcon]

export function Example() {
  return (
    <InfiniteCanvas
      className="h-80 w-full"
      cellSize={${v.cellSize}}
      tileSize={${v.tileSize}}
      overscan={${v.overscan}}
      items={icons.map((Icon, i) => (
        <Icon key={i} className="size-6" />
      ))}
    />
  )
}`,
  },

  "icon-tooltip": {
    controls: [
      {
        type: "select",
        prop: "side",
        label: "Side",
        default: "top",
        options: [
          { label: "Top", value: "top" },
          { label: "Bottom", value: "bottom" },
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
      },
      { type: "number", prop: "delay", label: "Delay", min: 0, max: 1000, step: 50, default: 0, hint: "ms" },
      { type: "number", prop: "duration", label: "Auto-hide", min: 0, max: 4000, step: 250, default: 0, hint: "ms" },
    ],
    render: (v) => (
      <IconTooltip
        icon={<GearIcon className="size-5" />}
        label="Settings"
        side={v.side as "top" | "bottom" | "left" | "right"}
        delay={v.delay as number}
        duration={v.duration as number}
      />
    ),
    code: (v) =>
      `import { IconTooltip } from "@/components/better/icon-tooltip"
import { GearIcon } from "@phosphor-icons/react"

export function Example() {
  return (
    <IconTooltip
      icon={<GearIcon className="size-5" />}
      label="Settings"
      side="${v.side}"
      delay={${v.delay}}
      duration={${v.duration}}
    />
  )
}`,
  },

  "text-shimmer": {
    controls: [
      { type: "number", prop: "duration", label: "Duration", min: 0.5, max: 5, step: 0.5, default: 1.5, hint: "s" },
      { type: "number", prop: "spread", label: "Spread", min: 1, max: 6, default: 2 },
    ],
    render: (v) => (
      <TextShimmer
        className="text-3xl font-medium"
        duration={v.duration as number}
        spread={v.spread as number}
      >
        Better Components
      </TextShimmer>
    ),
    code: (v) =>
      `import { TextShimmer } from "@/components/better/text-shimmer"

export function Example() {
  return (
    <TextShimmer className="text-3xl font-medium" duration={${v.duration}} spread={${v.spread}}>
      Better Components
    </TextShimmer>
  )
}`,
  },

  "number-ticker": {
    controls: [
      { type: "number", prop: "from", label: "Start", min: 0, max: 50000, step: 500, default: 0 },
      { type: "number", prop: "value", label: "End", min: 0, max: 50000, step: 500, default: 12480 },
      { type: "number", prop: "decimals", label: "Decimals", min: 0, max: 2, default: 0 },
      { type: "text", prop: "prefix", label: "Prefix", default: "" },
      { type: "text", prop: "suffix", label: "Suffix", default: "+" },
    ],
    // Key on `from` so changing the start value restarts the count from there.
    render: (v) => (
      <NumberTicker
        key={`${v.from}`}
        from={v.from as number}
        value={v.value as number}
        decimals={v.decimals as number}
        prefix={String(v.prefix)}
        suffix={String(v.suffix)}
        className="text-5xl font-semibold"
      />
    ),
    code: (v) =>
      `import { NumberTicker } from "@/components/better/number-ticker"

export function Example() {
  return (
    <NumberTicker
      from={${v.from}}
      value={${v.value}}
      decimals={${v.decimals}}
      prefix="${v.prefix}"
      suffix="${v.suffix}"
      className="text-5xl font-semibold"
    />
  )
}`,
  },

  "dots-loader": {
    controls: [
      { type: "number", prop: "size", label: "Size", min: 6, max: 24, default: 12, hint: "px" },
      { type: "number", prop: "count", label: "Count", min: 2, max: 6, default: 3 },
      { type: "number", prop: "gap", label: "Gap", min: 2, max: 20, default: 8, hint: "px" },
      { type: "number", prop: "bounce", label: "Bounce", min: 4, max: 30, default: 12, hint: "px" },
      { type: "number", prop: "speed", label: "Speed", min: 0.4, max: 2, step: 0.1, default: 0.9, hint: "s" },
      { type: "color", prop: "color", label: "Color", default: "#6366f1" },
    ],
    render: (v) => (
      <DotsLoader
        size={v.size as number}
        count={v.count as number}
        gap={v.gap as number}
        bounce={v.bounce as number}
        speed={v.speed as number}
        color={String(v.color)}
      />
    ),
    code: (v) =>
      `import { DotsLoader } from "@/components/better/dots-loader"

export function Example() {
  return (
    <DotsLoader
      size={${v.size}}
      count={${v.count}}
      gap={${v.gap}}
      bounce={${v.bounce}}
      speed={${v.speed}}
      color="${v.color}"
    />
  )
}`,
  },

  "bar-loader": {
    controls: [
      { type: "number", prop: "count", label: "Count", min: 3, max: 9, default: 5 },
      { type: "number", prop: "width", label: "Width", min: 2, max: 10, default: 4, hint: "px" },
      { type: "number", prop: "height", label: "Height", min: 16, max: 48, default: 28, hint: "px" },
      { type: "number", prop: "gap", label: "Gap", min: 2, max: 12, default: 4, hint: "px" },
      { type: "number", prop: "speed", label: "Speed", min: 0.4, max: 2, step: 0.1, default: 1, hint: "s" },
      { type: "color", prop: "color", label: "Color", default: "#6366f1" },
    ],
    render: (v) => (
      <BarLoader
        count={v.count as number}
        width={v.width as number}
        height={v.height as number}
        gap={v.gap as number}
        speed={v.speed as number}
        color={String(v.color)}
      />
    ),
    code: (v) =>
      `import { BarLoader } from "@/components/better/bar-loader"

export function Example() {
  return (
    <BarLoader count={${v.count}} width={${v.width}} height={${v.height}} gap={${v.gap}} speed={${v.speed}} color="${v.color}" />
  )
}`,
  },

  "grid-pulse": {
    controls: [
      { type: "number", prop: "rows", label: "Rows", min: 2, max: 6, default: 3 },
      { type: "number", prop: "cols", label: "Cols", min: 2, max: 6, default: 3 },
      { type: "number", prop: "dotSize", label: "Dot Size", min: 4, max: 14, default: 8, hint: "px" },
      { type: "number", prop: "gap", label: "Gap", min: 2, max: 14, default: 6, hint: "px" },
      { type: "number", prop: "speed", label: "Speed", min: 0.6, max: 3, step: 0.1, default: 1.4, hint: "s" },
      { type: "color", prop: "color", label: "Color", default: "#6366f1" },
    ],
    render: (v) => (
      <GridPulse
        rows={v.rows as number}
        cols={v.cols as number}
        dotSize={v.dotSize as number}
        gap={v.gap as number}
        speed={v.speed as number}
        color={String(v.color)}
      />
    ),
    code: (v) =>
      `import { GridPulse } from "@/components/better/grid-pulse"

export function Example() {
  return (
    <GridPulse rows={${v.rows}} cols={${v.cols}} dotSize={${v.dotSize}} gap={${v.gap}} speed={${v.speed}} color="${v.color}" />
  )
}`,
  },

  "ring-spinner": {
    controls: [
      { type: "number", prop: "size", label: "Size", min: 20, max: 72, default: 40, hint: "px" },
      { type: "number", prop: "thickness", label: "Thickness", min: 2, max: 10, default: 4, hint: "px" },
      { type: "number", prop: "arc", label: "Arc", min: 0.1, max: 0.9, step: 0.05, default: 0.25 },
      { type: "number", prop: "speed", label: "Speed", min: 0.4, max: 2.5, step: 0.1, default: 0.9, hint: "s" },
      { type: "color", prop: "color", label: "Color", default: "#6366f1" },
    ],
    render: (v) => (
      <RingSpinner
        size={v.size as number}
        thickness={v.thickness as number}
        arc={v.arc as number}
        speed={v.speed as number}
        color={String(v.color)}
      />
    ),
    code: (v) =>
      `import { RingSpinner } from "@/components/better/ring-spinner"

export function Example() {
  return (
    <RingSpinner size={${v.size}} thickness={${v.thickness}} arc={${v.arc}} speed={${v.speed}} color="${v.color}" />
  )
}`,
  },

  "orbit-loader": {
    controls: [
      { type: "number", prop: "size", label: "Size", min: 24, max: 72, default: 40, hint: "px" },
      { type: "number", prop: "count", label: "Count", min: 2, max: 8, default: 3 },
      { type: "number", prop: "dotSize", label: "Dot Size", min: 4, max: 14, default: 8, hint: "px" },
      { type: "number", prop: "speed", label: "Speed", min: 0.5, max: 3, step: 0.1, default: 1.2, hint: "s" },
      { type: "color", prop: "color", label: "Color", default: "#6366f1" },
    ],
    render: (v) => (
      <OrbitLoader
        size={v.size as number}
        count={v.count as number}
        dotSize={v.dotSize as number}
        speed={v.speed as number}
        color={String(v.color)}
      />
    ),
    code: (v) =>
      `import { OrbitLoader } from "@/components/better/orbit-loader"

export function Example() {
  return (
    <OrbitLoader size={${v.size}} count={${v.count}} dotSize={${v.dotSize}} speed={${v.speed}} color="${v.color}" />
  )
}`,
  },

  marquee: {
    note: "Children are whatever you pass — pills, logos, cards, images. Pause and Slow on hover both keep the scroll where it is rather than jumping.",
    controls: [
      {
        type: "select",
        prop: "content",
        label: "Content",
        default: "text",
        options: [
          { label: "Text", value: "text" },
          { label: "Images", value: "images" },
        ],
      },
      {
        type: "images",
        prop: "images",
        label: "Your images",
        min: MARQUEE_MIN_IMAGES,
        max: MARQUEE_MAX_IMAGES,
        // Nothing is shown until you add your own.
        default: [],
        showIf: (v) => v.content === "images",
      },
      { type: "number", prop: "duration", label: "Duration", min: 4, max: 40, default: 14, hint: "s" },
      { type: "number", prop: "imageSize", label: "Image size", min: 40, max: 160, step: 4, default: 80, hint: "px", showIf: (v) => v.content === "images" },
      { type: "boolean", prop: "reverse", label: "Reverse", default: false },
      { type: "boolean", prop: "pauseOnHover", label: "Pause on hover", default: false },
      { type: "boolean", prop: "slowOnHover", label: "Slow on hover", default: true },
    ],
    render: (v) => {
      const images = v.images as string[]
      const useImages = v.content === "images"

      if (useImages && images.length < MARQUEE_MIN_IMAGES) {
        return (
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            Upload at least {MARQUEE_MIN_IMAGES} images to preview the marquee.
          </p>
        )
      }

      return (
        <Marquee
          className="w-72"
          duration={v.duration as number}
          reverse={v.reverse as boolean}
          pauseOnHover={v.pauseOnHover as boolean}
          slowOnHover={v.slowOnHover as boolean}
        >
          {useImages
            ? images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${src}-${i}`}
                  src={src}
                  alt=""
                  style={{
                    width: v.imageSize as number,
                    height: v.imageSize as number,
                  }}
                  className="shrink-0 rounded-xl border border-border object-cover"
                />
              ))
            : ["Motion", "Design", "Animate", "Export", "Create"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border px-4 py-1.5 text-sm font-medium"
                >
                  {t}
                </span>
              ))}
        </Marquee>
      )
    },
    code: (v) =>
      v.content === "images"
        ? `import { Marquee } from "@/components/better/marquee"

const logos = ["/a.png", "/b.png", "/c.png"]

export function Example() {
  return (
    <Marquee duration={${v.duration}} reverse={${v.reverse}} pauseOnHover={${v.pauseOnHover}} slowOnHover={${v.slowOnHover}}>
      {logos.map((src) => (
        <img
          key={src}
          src={src}
          alt=""
          width={${v.imageSize}}
          height={${v.imageSize}}
          className="shrink-0 rounded-xl border border-border object-cover"
        />
      ))}
    </Marquee>
  )
}`
        : `import { Marquee } from "@/components/better/marquee"

const items = ["Motion", "Design", "Animate", "Export", "Create"]

export function Example() {
  return (
    <Marquee duration={${v.duration}} reverse={${v.reverse}} pauseOnHover={${v.pauseOnHover}} slowOnHover={${v.slowOnHover}}>
      {items.map((t) => (
        <span key={t} className="rounded-full border border-border px-4 py-1.5 text-sm font-medium">
          {t}
        </span>
      ))}
    </Marquee>
  )
}`,
  },

  "stop-motion": {
    controls: [
      { type: "number", prop: "fps", label: "FPS", min: 2, max: 16, default: 8 },
    ],
    render: (v) => (
      <StopMotion className="text-4xl font-semibold" fps={v.fps as number}>
        Stop Motion
      </StopMotion>
    ),
    code: (v) =>
      `import { StopMotion } from "@/components/better/stop-motion"

export function Example() {
  return (
    <StopMotion className="text-4xl font-semibold" fps={${v.fps}}>
      Stop Motion
    </StopMotion>
  )
}`,
  },

  flipbook: {
    controls: [
      {
        type: "select",
        prop: "frames",
        label: "Frames",
        default: "emoji",
        options: [
          { label: "Emoji", value: "emoji" },
          { label: "Images", value: "images" },
        ],
      },
      {
        type: "images",
        prop: "images",
        label: "Your frames",
        min: FLIPBOOK_MIN_FRAMES,
        max: FLIPBOOK_MAX_FRAMES,
        default: BALL_FRAMES,
        hint: "square",
        showIf: (v) => v.frames === "images",
      },
      // Images are drawn into a square box, so one number sizes both sides.
      { type: "number", prop: "size", label: "Size", min: 48, max: 200, step: 4, default: 96, hint: "px" },
      { type: "number", prop: "fps", label: "FPS", min: 1, max: 8, default: 4 },
      { type: "boolean", prop: "jitter", label: "Jitter", default: true },
    ],
    render: (v) =>
      v.frames === "images" ? (
        <Flipbook
          images={v.images as string[]}
          alt="Flipbook frames"
          size={v.size as number}
          fps={v.fps as number}
          jitter={v.jitter as boolean}
        />
      ) : (
        // Emoji frames size themselves off the inherited font size.
        <div style={{ fontSize: (v.size as number) * 0.6 }}>
          <Flipbook fps={v.fps as number} jitter={v.jitter as boolean}>
            <span>✊</span>
            <span>✋</span>
            <span>✌️</span>
          </Flipbook>
        </div>
      ),
    code: (v) =>
      v.frames === "images"
        ? `import { Flipbook } from "@/components/better/flipbook"

// Every image must have the SAME width and height (a square source) — frames
// are drawn into a square size×size box, so a mismatched aspect ratio crops.
const frames = [
${(v.images as string[])
  .map((src) => `  "${src.startsWith("blob:") ? "/your-frame.png" : src}",`)
  .join("\n")}
]

export function Example() {
  return (
    <Flipbook
      images={frames}
      alt="A bouncing ball"
      size={${v.size}}
      fps={${v.fps}}
      jitter={${v.jitter}}
    />
  )
}`
        : `import { Flipbook } from "@/components/better/flipbook"

export function Example() {
  return (
    <Flipbook fps={${v.fps}} jitter={${v.jitter}}>
      <span>✊</span>
      <span>✋</span>
      <span>✌️</span>
    </Flipbook>
  )
}`,
  },

  "sketch-border": {
    controls: [
      { type: "color", prop: "color", label: "Color", default: "#6366f1" },
      { type: "number", prop: "strokeWidth", label: "Stroke", min: 1, max: 6, default: 2, hint: "px" },
      { type: "number", prop: "roughness", label: "Roughness", min: 1, max: 8, default: 4 },
      { type: "number", prop: "radius", label: "Radius", min: 0, max: 24, default: 10, hint: "px" },
    ],
    render: (v) => (
      <SketchBorder
        color={String(v.color)}
        strokeWidth={v.strokeWidth as number}
        roughness={v.roughness as number}
        radius={v.radius as number}
      >
        <span className="px-4 py-2 text-lg font-medium">Hand drawn</span>
      </SketchBorder>
    ),
    code: (v) =>
      `import { SketchBorder } from "@/components/better/sketch-border"

export function Example() {
  return (
    <SketchBorder color="${v.color}" strokeWidth={${v.strokeWidth}} roughness={${v.roughness}} radius={${v.radius}}>
      <span className="px-4 py-2 text-lg font-medium">Hand drawn</span>
    </SketchBorder>
  )
}`,
  },

  avatar: {
    controls: [
      { type: "text", prop: "seed", label: "Seed", default: "bikash" },
      {
        type: "select",
        prop: "style",
        label: "Style",
        default: "gradient",
        // Only CC0 DiceBear styles, plus our own paper.design shader.
        options: AVATAR_STYLES.map((s) => ({ label: s, value: s })),
      },
      { type: "number", prop: "size", label: "Size", min: 32, max: 200, step: 4, default: 96, hint: "px" },
      { type: "boolean", prop: "round", label: "Round", default: true },
      { type: "number", prop: "speed", label: "Shader speed", min: 0, max: 2, step: 0.1, default: 0, hint: "gradient only" },
    ],
    render: (v) => (
      <Avatar
        seed={String(v.seed)}
        style={v.style as (typeof AVATAR_STYLES)[number]}
        size={v.size as number}
        round={v.round as boolean}
        speed={v.speed as number}
      />
    ),
    code: (v) =>
      `import { Avatar } from "@/components/better/avatar"

// npm i @dicebear/core @dicebear/collection
// Same seed always renders the same avatar.

export function Example() {
  return (
    <Avatar
      seed="${v.seed}"
      style="${v.style}"
      size={${v.size}}
      round={${v.round}}${v.style === "gradient" ? `\n      speed={${v.speed}}` : ""}
    />
  )
}`,
  },

  paper: {
    controls: [
      // Same photo the Magnetic Card uses, until you upload your own.
      { type: "image", prop: "image", label: "Image", default: "/hero_image.jpg" },
      { type: "boolean", prop: "useImage", label: "Use image", default: true },
      { type: "color", prop: "color", label: "Back", default: "#f4efe4" },
      { type: "color", prop: "colorFront", label: "Front", default: "#9fadbc" },
      { type: "number", prop: "contrast", label: "Contrast", min: 0, max: 1, step: 0.05, default: 0.3 },
      { type: "number", prop: "roughness", label: "Roughness", min: 0, max: 1, step: 0.05, default: 0.4 },
      { type: "number", prop: "fiber", label: "Fiber", min: 0, max: 1, step: 0.05, default: 0.3 },
      { type: "number", prop: "fiberSize", label: "Fiber size", min: 0, max: 1, step: 0.05, default: 0.2 },
      { type: "number", prop: "crumples", label: "Crumples", min: 0, max: 1, step: 0.05, default: 0.3 },
      { type: "number", prop: "crumpleSize", label: "Crumple size", min: 0, max: 1, step: 0.05, default: 0.35 },
      { type: "number", prop: "folds", label: "Folds", min: 0, max: 1, step: 0.05, default: 0.65 },
      { type: "number", prop: "foldCount", label: "Fold count", min: 1, max: 15, default: 5 },
      { type: "number", prop: "drops", label: "Drops", min: 0, max: 1, step: 0.05, default: 0.2 },
      { type: "number", prop: "fade", label: "Fade", min: 0, max: 1, step: 0.05, default: 0 },
      { type: "number", prop: "seed", label: "Seed", min: 0, max: 1000, default: 6 },
      { type: "number", prop: "radius", label: "Radius", min: 0, max: 40, default: 16, hint: "px" },
    ],
    render: (v) => (
      <Paper
        image={v.useImage ? String(v.image) : undefined}
        color={String(v.color)}
        colorFront={String(v.colorFront)}
        contrast={v.contrast as number}
        roughness={v.roughness as number}
        fiber={v.fiber as number}
        fiberSize={v.fiberSize as number}
        crumples={v.crumples as number}
        crumpleSize={v.crumpleSize as number}
        folds={v.folds as number}
        foldCount={v.foldCount as number}
        drops={v.drops as number}
        fade={v.fade as number}
        seed={v.seed as number}
        radius={v.radius as number}
        className="flex h-56 w-80 items-end justify-start p-4"
      >
        {!v.useImage && (
          <span className="text-xl font-medium text-neutral-800">Paper</span>
        )}
      </Paper>
    ),
    code: (v) =>
      `import { Paper } from "@/components/better/paper"

export function Example() {
  return (
    <Paper${v.useImage ? `\n      image="/photo.jpg"` : ""}
      color="${v.color}"
      colorFront="${v.colorFront}"
      contrast={${v.contrast}}
      roughness={${v.roughness}}
      fiber={${v.fiber}}
      fiberSize={${v.fiberSize}}
      crumples={${v.crumples}}
      crumpleSize={${v.crumpleSize}}
      folds={${v.folds}}
      foldCount={${v.foldCount}}
      drops={${v.drops}}
      fade={${v.fade}}
      seed={${v.seed}}
      radius={${v.radius}}
      className="h-56 w-80"
    />
  )
}`,
  },
}

export function hasPlayground(slug: string) {
  return slug in PLAYGROUNDS
}

/* ----------------------------------------------------------------- */
/* Controls                                                           */
/* ----------------------------------------------------------------- */

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 px-3.5 py-3">
      {children}
    </div>
  )
}

function Hint({ text }: { text: string }) {
  return (
    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      {text}
    </span>
  )
}

const uploadButtonClass =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"

/**
 * Object URLs created for previews. They stay alive for the life of the page
 * (the preview keeps referencing them) and are revoked together on unmount.
 */
function useObjectUrls() {
  const created = useRef<string[]>([])

  useEffect(() => {
    const urls = created.current
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  return (files: File[]) =>
    files.map((file) => {
      const url = URL.createObjectURL(file)
      created.current.push(url)
      return url
    })
}

/** Upload one image; falls back to the shipped default. */
function ImageField({
  control,
  value,
  onChange,
}: {
  control: Extract<ControlKind, { type: "image" }>
  value: string
  onChange: (v: Value) => void
}) {
  const toUrls = useObjectUrls()

  return (
    <Row>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm">{control.label}</span>
        <div className="flex items-center gap-2">
          {value !== control.default && (
            <button
              onClick={() => onChange(control.default)}
              className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          )}
          <label className={uploadButtonClass}>
            <UploadSimpleIcon className="size-3.5" />
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onChange(toUrls([file])[0])
              }}
            />
          </label>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="size-9 shrink-0 rounded-md border border-border/60 object-cover"
          />
        </div>
      </div>
    </Row>
  )
}

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i])

/** Upload a sequence of frames — at least `min`, at most `max`. */
function ImagesField({
  control,
  value,
  onChange,
}: {
  control: Extract<ControlKind, { type: "images" }>
  value: string[]
  onChange: (v: Value) => void
}) {
  const toUrls = useObjectUrls()
  const [error, setError] = useState<string | null>(null)

  function add(files: File[]) {
    if (files.length === 0) return
    const next = [...value, ...toUrls(files)]
    if (next.length > control.max) {
      setError(`At most ${control.max} frames — extras ignored.`)
    } else {
      setError(null)
    }
    onChange(next.slice(0, control.max))
  }

  function removeAt(i: number) {
    const next = value.filter((_, n) => n !== i)
    // Below the minimum the flipbook has nothing to cycle, so say so rather
    // than silently rendering a still frame.
    setError(
      next.length < control.min ? `Needs at least ${control.min} frames.` : null
    )
    onChange(next)
  }

  return (
    <Row>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm">
          {control.label}
          {control.hint && <Hint text={control.hint} />}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {value.length}/{control.max}
          </span>
          <label className={uploadButtonClass}>
            <UploadSimpleIcon className="size-3.5" />
            Upload
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                add(Array.from(e.target.files ?? []))
                // Let the same file be picked again after a remove.
                e.target.value = ""
              }}
            />
          </label>
        </div>
      </div>

      {value.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {value.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => removeAt(i)}
              title="Remove frame"
              className="group relative size-9 overflow-hidden rounded-md border border-border/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" />
              <span className="absolute inset-0 hidden items-center justify-center bg-background/70 group-hover:flex">
                <XIcon className="size-3.5" />
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="mt-2 text-[11px] text-muted-foreground">
        {error ?? (
          <>
            {control.min}–{control.max} frames, each the same width and height.
          </>
        )}
      </p>

      {/* Only offered once the value differs from what it shipped with — and
          only when there's something to go back to. */}
      {control.default.length > 0 && !sameList(value, control.default) && (
        <button
          onClick={() => {
            setError(null)
            onChange(control.default)
          }}
          className="mt-1 cursor-pointer text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Reset to sample frames
        </button>
      )}
    </Row>
  )
}

function ControlField({
  control,
  value,
  onChange,
}: {
  control: Control
  value: Value
  onChange: (v: Value) => void
}) {
  if (control.type === "select") {
    return (
      <Row>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">{control.label}</span>
          <div className="relative">
            <select
              value={String(value)}
              onChange={(e) => onChange(e.target.value)}
              className="cursor-pointer appearance-none rounded-lg border border-border/60 bg-background py-1.5 pl-3 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {control.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <CaretDownIcon className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </Row>
    )
  }

  if (control.type === "number") {
    return (
      <Row>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            {control.label}
            {control.hint && <Hint text={control.hint} />}
          </span>
          <span className="font-mono text-sm tabular-nums text-muted-foreground">
            {value as number}
          </span>
        </div>
        <input
          type="range"
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-2.5 h-1 w-full cursor-pointer appearance-none rounded-full bg-border accent-foreground"
        />
      </Row>
    )
  }

  if (control.type === "boolean") {
    return (
      <Row>
        <div className="flex items-center justify-between">
          <span className="text-sm">{control.label}</span>
          <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-background p-0.5">
            {[
              { label: "Off", on: false },
              { label: "On", on: true },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => onChange(opt.on)}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  (value as boolean) === opt.on
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </Row>
    )
  }

  if (control.type === "color") {
    return (
      <Row>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">{control.label}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {String(value)}
            </span>
            <input
              type="color"
              value={String(value)}
              onChange={(e) => onChange(e.target.value)}
              className="size-7 shrink-0 cursor-pointer overflow-hidden rounded-full border border-border/60 p-0 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
            />
          </div>
        </div>
      </Row>
    )
  }

  if (control.type === "image") {
    return <ImageField control={control} value={String(value)} onChange={onChange} />
  }

  if (control.type === "images") {
    return (
      <ImagesField
        control={control}
        value={(value as string[]) ?? []}
        onChange={onChange}
      />
    )
  }

  // text
  return (
    <Row>
      <div className="flex items-center justify-between gap-3">
        <span className="shrink-0 text-sm">{control.label}</span>
        <input
          type="text"
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-40 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-right text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </div>
    </Row>
  )
}

/* ----------------------------------------------------------------- */
/* Playground shell                                                   */
/* ----------------------------------------------------------------- */

export function ComponentPlayground({ slug }: { slug: string }) {
  const config = PLAYGROUNDS[slug]

  const [values, setValues] = useState<Values>(() =>
    config
      ? Object.fromEntries(config.controls.map((c) => [c.prop, c.default]))
      : {}
  )

  const code = useMemo(
    () => (config ? config.code(values) : ""),
    [config, values]
  )

  if (!config) return null

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/20 p-6">
          {config.render(values)}
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center border-b border-border/60 px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              Example.tsx
            </span>
          </div>
          <CodeBlock code={code} lang="tsx" />
        </div>
      </div>

      <aside className="flex max-h-[80svh] flex-col gap-2 overflow-auto rounded-2xl border border-border bg-card p-3">
        <p className="px-1 pb-1 text-sm font-medium">Playground</p>
        {config.note && (
          <p className="rounded-xl border border-border/60 bg-muted/30 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
            {config.note}
          </p>
        )}
        {config.controls
          .filter((c) => c.showIf?.(values) ?? true)
          .map((c) => (
            <ControlField
              key={c.prop}
              control={c}
              value={values[c.prop]}
              onChange={(v) => setValues((prev) => ({ ...prev, [c.prop]: v }))}
            />
          ))}
      </aside>
    </div>
  )
}
