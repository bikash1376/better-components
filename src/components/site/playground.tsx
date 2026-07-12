"use client"

import { useMemo, useState, type ReactNode } from "react"
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
  UserIcon,
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

type Value = string | number | boolean
export type Values = Record<string, Value>

type Control =
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

interface PlaygroundConfig {
  controls: Control[]
  render: (v: Values) => ReactNode
  code: (v: Values) => string
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

function CanvasPreview({
  cellSize,
  overscan,
}: {
  cellSize: number
  overscan: number
}) {
  const items = CANVAS_ICONS.map((Icon, i) => (
    <Icon key={i} className="size-6" />
  ))
  return (
    <InfiniteCanvas
      items={items}
      cellSize={cellSize}
      overscan={overscan}
      className="h-64 w-full"
    />
  )
}

/** The three sample frames shipped in `public/flipbook/`. */
const BALL_FRAMES = [
  "/flipbook/ball-1.svg",
  "/flipbook/ball-2.svg",
  "/flipbook/ball-3.svg",
]

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
    ],
    render: (v) => (
      <StaticButton
        variant={v.variant as "primary" | "secondary" | "outline" | "ghost" | "gradient"}
        size={v.size as "sm" | "md" | "lg"}
        radius={v.radius as number}
        disabled={v.disabled as boolean}
      >
        {String(v.label)}
      </StaticButton>
    ),
    code: (v) =>
      `import { StaticButton } from "@/components/better/static-button"

export function Example() {
  return (
    <StaticButton variant="${v.variant}" size="${v.size}" radius={${v.radius}}${
      v.disabled ? " disabled" : ""
    }>
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
    controls: [
      { type: "number", prop: "cellSize", label: "Cell Size", min: 60, max: 140, default: 88, hint: "px" },
      { type: "number", prop: "overscan", label: "Overscan", min: 0, max: 3, default: 1, hint: "cells" },
    ],
    render: (v) => (
      <CanvasPreview cellSize={v.cellSize as number} overscan={v.overscan as number} />
    ),
    code: (v) =>
      `import { InfiniteCanvas } from "@/components/better/infinite-canvas"
import { HouseIcon, UserIcon, BellIcon, HeartIcon, StarIcon } from "@phosphor-icons/react"

export function Example() {
  const icons = [HouseIcon, UserIcon, BellIcon, HeartIcon, StarIcon]
  return (
    <InfiniteCanvas
      className="h-80 w-full"
      cellSize={${v.cellSize}}
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
    controls: [
      { type: "number", prop: "duration", label: "Duration", min: 4, max: 40, default: 14, hint: "s" },
      { type: "boolean", prop: "reverse", label: "Reverse", default: false },
      { type: "boolean", prop: "pauseOnHover", label: "Pause on hover", default: false },
      { type: "boolean", prop: "slowOnHover", label: "Slow on hover", default: true },
    ],
    render: (v) => (
      <Marquee
        className="w-72"
        duration={v.duration as number}
        reverse={v.reverse as boolean}
        pauseOnHover={v.pauseOnHover as boolean}
        slowOnHover={v.slowOnHover as boolean}
      >
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
    code: (v) =>
      `import { Marquee } from "@/components/better/marquee"

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
      // Images are drawn into a square box, so one number sizes both sides.
      { type: "number", prop: "size", label: "Size", min: 48, max: 200, step: 4, default: 96, hint: "px" },
      { type: "number", prop: "fps", label: "FPS", min: 1, max: 8, default: 4 },
      { type: "boolean", prop: "jitter", label: "Jitter", default: true },
    ],
    render: (v) =>
      v.frames === "images" ? (
        <Flipbook
          images={BALL_FRAMES}
          alt="A bouncing ball"
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
const frames = ["/flipbook/ball-1.svg", "/flipbook/ball-2.svg", "/flipbook/ball-3.svg"]

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
      { type: "color", prop: "color", label: "Color", default: "#f4efe4" },
      { type: "number", prop: "grain", label: "Grain", min: 0, max: 1, step: 0.05, default: 0.4 },
      { type: "number", prop: "fibers", label: "Fibers", min: 0, max: 1, step: 0.05, default: 0.25 },
      { type: "number", prop: "strength", label: "Strength", min: 0, max: 1, step: 0.05, default: 0.6 },
      {
        type: "select",
        prop: "edge",
        label: "Edge",
        default: "straight",
        options: [
          { label: "Straight", value: "straight" },
          { label: "Hand-drawn", value: "handdrawn" },
          { label: "Torn", value: "torn" },
          { label: "Cutout", value: "cutout" },
        ],
      },
      { type: "number", prop: "distort", label: "Distort", min: 0, max: 12, default: 0, hint: "px" },
      { type: "number", prop: "radius", label: "Radius", min: 0, max: 40, default: 16, hint: "px" },
    ],
    render: (v) => (
      <Paper
        color={String(v.color)}
        grain={v.grain as number}
        fibers={v.fibers as number}
        strength={v.strength as number}
        edge={v.edge as "straight" | "handdrawn" | "torn" | "cutout"}
        distort={v.distort as number}
        radius={v.radius as number}
        className="flex h-48 w-72 items-center justify-center"
      >
        <span className="text-xl font-medium text-neutral-800">Paper</span>
      </Paper>
    ),
    code: (v) =>
      `import { Paper } from "@/components/better/paper"

export function Example() {
  return (
    <Paper
      color="${v.color}"
      grain={${v.grain}}
      fibers={${v.fibers}}
      strength={${v.strength}}
      edge="${v.edge}"
      distort={${v.distort}}
      radius={${v.radius}}
      className="flex h-48 w-72 items-center justify-center"
    >
      <span className="text-xl font-medium text-neutral-800">Paper</span>
    </Paper>
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

      <aside className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3">
        <p className="px-1 pb-1 text-sm font-medium">Playground</p>
        {config.controls.map((c) => (
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
