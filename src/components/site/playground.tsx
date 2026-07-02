"use client"

import { useMemo, useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { Phone, PhoneDisconnect } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { useIcons } from "@/components/site/icons"
import { CodeBlock } from "@/components/site/code-block"
import { StaticButton } from "@/components/better/static-button"
import { MagneticCard } from "@/components/better/magnetic-card"
import { MagneticButton } from "@/components/better/magnetic-button"
import { DynamicIsland } from "@/components/better/dynamic-island"
import { InfiniteCanvas } from "@/components/better/infinite-canvas"
import { TextShimmer } from "@/components/better/text-shimmer"
import { StopMotion } from "@/components/better/stop-motion"
import { Flipbook } from "@/components/better/flipbook"
import { SketchBorder } from "@/components/better/sketch-border"
import { NumberTicker } from "@/components/better/number-ticker"
import { DotsLoader } from "@/components/better/dots-loader"
import { Marquee } from "@/components/better/marquee"
import { IconTooltip } from "@/components/better/icon-tooltip"
import { NotificationCard } from "@/components/better/notification-card"
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
/* Previews that need hooks live as their own components              */
/* ----------------------------------------------------------------- */

function TooltipPreview({ side, delay }: { side: string; delay: number }) {
  const { icons } = useIcons()
  return (
    <IconTooltip
      icon={<icons.settings className="size-5" />}
      label="Settings"
      side={side as "top" | "bottom" | "left" | "right"}
      delay={delay}
    />
  )
}

function NotificationPreview({
  title,
  message,
  accent,
  action,
}: {
  title: string
  message: string
  accent: string
  action: boolean
}) {
  const { icons } = useIcons()
  return (
    <NotificationCard
      icon={<icons.star className="size-4" />}
      title={title}
      message={message}
      time="now"
      accent={accent as "neutral" | "blue" | "emerald" | "amber" | "rose"}
      action={action ? { label: "View" } : undefined}
      closeIcon={<icons.close className="size-4" />}
    />
  )
}

function islandScenarios(
  icons: ReturnType<typeof useIcons>["icons"]
): Record<string, { compact: ReactNode; expanded: ReactNode }> {
  return {
    call: {
      compact: (
        <div className="flex items-center gap-2.5 px-1">
          <span className="flex size-6 items-center justify-center rounded-full bg-green-500">
            <Phone weight="fill" className="size-3.5" />
          </span>
          <span className="text-sm font-medium">Aanya</span>
        </div>
      ),
      expanded: (
        <div className="flex w-60 flex-col gap-3.5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-white/10">
              <icons.user className="size-5" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium">Aanya Sharma</span>
              <span className="text-xs text-white/50">mobile · calling…</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-red-500 py-2 text-sm font-medium">
              <PhoneDisconnect weight="fill" className="size-4" />
              Decline
            </button>
            <button className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-green-500 py-2 text-sm font-medium">
              <Phone weight="fill" className="size-4" />
              Accept
            </button>
          </div>
        </div>
      ),
    },
    music: {
      compact: (
        <div className="flex items-center gap-2.5 px-1">
          <icons.star className="size-4 text-lime-400" />
          <span className="text-sm font-medium">Aura</span>
        </div>
      ),
      expanded: (
        <div className="flex w-64 flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="size-11 rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-500" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium">Aura</span>
              <span className="text-xs text-white/50">Tycho</span>
            </div>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-2/5 rounded-full bg-white" />
          </div>
        </div>
      ),
    },
    timer: {
      compact: (
        <div className="flex items-center gap-2.5 px-1">
          <span className="size-2 rounded-full bg-orange-400" />
          <span className="font-mono text-sm font-medium tabular-nums">
            12:30
          </span>
        </div>
      ),
      expanded: (
        <div className="flex w-56 items-center justify-between gap-3">
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-white/50">Timer</span>
            <span className="font-mono text-2xl font-semibold tabular-nums">
              12:30
            </span>
          </div>
          <div className="flex gap-2">
            <span className="size-9 rounded-full bg-white/15" />
            <span className="size-9 rounded-full bg-orange-500" />
          </div>
        </div>
      ),
    },
  }
}

function IslandPreview({ scenario }: { scenario: string }) {
  const { icons } = useIcons()
  const [open, setOpen] = useState(false)
  const content = islandScenarios(icons)[scenario]
  return (
    <div className="flex flex-col items-center gap-3">
      <DynamicIsland
        open={open}
        onOpenChange={setOpen}
        compact={content.compact}
        expanded={content.expanded}
      />
      <span className="text-xs text-muted-foreground">
        {open ? "Click to collapse" : "Click the island to expand"}
      </span>
    </div>
  )
}

function CanvasPreview({
  cellSize,
  overscan,
}: {
  cellSize: number
  overscan: number
}) {
  const { icons } = useIcons()
  const items = [
    icons.home,
    icons.user,
    icons.bell,
    icons.heart,
    icons.star,
    icons.settings,
    icons.search,
    icons.mail,
    icons.code,
  ].map((Icon, i) => <Icon key={i} className="size-6" />)
  return (
    <InfiniteCanvas
      items={items}
      cellSize={cellSize}
      overscan={overscan}
      className="h-64 w-full"
    />
  )
}

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

  "dynamic-island": {
    controls: [
      {
        type: "select",
        prop: "scenario",
        label: "Scenario",
        default: "call",
        options: [
          { label: "Call", value: "call" },
          { label: "Music", value: "music" },
          { label: "Timer", value: "timer" },
        ],
      },
    ],
    render: (v) => <IslandPreview scenario={String(v.scenario)} />,
    code: () =>
      `import { DynamicIsland } from "@/components/better/dynamic-island"
import { Phone, PhoneDisconnect } from "@phosphor-icons/react"

export function Example() {
  return (
    <DynamicIsland
      compact={<span className="px-1 text-sm font-medium">Aanya</span>}
      expanded={
        <div className="flex w-60 gap-2">
          <button className="flex-1 rounded-full bg-red-500 py-2">Decline</button>
          <button className="flex-1 rounded-full bg-green-500 py-2">Accept</button>
        </div>
      }
    />
  )
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
import { Home, User, Bell, Heart, Star } from "lucide-react"

export function Example() {
  const icons = [Home, User, Bell, Heart, Star]
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
    ],
    render: (v) => (
      <TooltipPreview side={String(v.side)} delay={v.delay as number} />
    ),
    code: (v) =>
      `import { IconTooltip } from "@/components/better/icon-tooltip"
import { Settings } from "lucide-react"

export function Example() {
  return (
    <IconTooltip
      icon={<Settings className="size-5" />}
      label="Settings"
      side="${v.side}"
      delay={${v.delay}}
    />
  )
}`,
  },

  "notification-card": {
    controls: [
      { type: "text", prop: "title", label: "Title", default: "New star" },
      { type: "text", prop: "message", label: "Message", default: "Someone starred your component." },
      {
        type: "select",
        prop: "accent",
        label: "Accent",
        default: "amber",
        options: [
          { label: "Neutral", value: "neutral" },
          { label: "Blue", value: "blue" },
          { label: "Emerald", value: "emerald" },
          { label: "Amber", value: "amber" },
          { label: "Rose", value: "rose" },
        ],
      },
      { type: "boolean", prop: "action", label: "Action", default: true },
    ],
    render: (v) => (
      <NotificationPreview
        title={String(v.title)}
        message={String(v.message)}
        accent={String(v.accent)}
        action={v.action as boolean}
      />
    ),
    code: (v) =>
      `import { NotificationCard } from "@/components/better/notification-card"
import { Star, X } from "lucide-react"

export function Example() {
  return (
    <NotificationCard
      icon={<Star className="size-4" />}
      title="${v.title}"
      message="${v.message}"
      time="now"
      accent="${v.accent}"${v.action ? `\n      action={{ label: "View" }}` : ""}
      closeIcon={<X className="size-4" />}
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
      { type: "number", prop: "value", label: "Value", min: 0, max: 50000, step: 500, default: 12480 },
      { type: "number", prop: "decimals", label: "Decimals", min: 0, max: 2, default: 0 },
      { type: "text", prop: "suffix", label: "Suffix", default: "+" },
    ],
    render: (v) => (
      <NumberTicker
        value={v.value as number}
        decimals={v.decimals as number}
        suffix={String(v.suffix)}
        className="text-5xl font-semibold"
      />
    ),
    code: (v) =>
      `import { NumberTicker } from "@/components/better/number-ticker"

export function Example() {
  return (
    <NumberTicker
      value={${v.value}}
      decimals={${v.decimals}}
      suffix="${v.suffix}"
      className="text-5xl font-semibold"
    />
  )
}`,
  },

  "dots-loader": {
    controls: [
      { type: "number", prop: "size", label: "Size", min: 6, max: 24, default: 12, hint: "px" },
    ],
    render: (v) => <DotsLoader size={v.size as number} />,
    code: (v) =>
      `import { DotsLoader } from "@/components/better/dots-loader"

export function Example() {
  return <DotsLoader size={${v.size}} />
}`,
  },

  marquee: {
    controls: [
      { type: "number", prop: "duration", label: "Duration", min: 4, max: 40, default: 14, hint: "s" },
      { type: "boolean", prop: "reverse", label: "Reverse", default: false },
      { type: "boolean", prop: "pauseOnHover", label: "Pause on hover", default: true },
    ],
    render: (v) => (
      <Marquee
        className="w-72"
        duration={v.duration as number}
        reverse={v.reverse as boolean}
        pauseOnHover={v.pauseOnHover as boolean}
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

export function Example() {
  return (
    <Marquee duration={${v.duration}} reverse={${v.reverse}} pauseOnHover={${v.pauseOnHover}}>
      <span>Motion</span>
      <span>Design</span>
      <span>Animate</span>
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
      { type: "number", prop: "fps", label: "FPS", min: 1, max: 8, default: 4 },
      { type: "boolean", prop: "jitter", label: "Jitter", default: true },
    ],
    render: (v) => (
      <Flipbook
        className="text-5xl"
        fps={v.fps as number}
        jitter={v.jitter as boolean}
      >
        <span>✊</span>
        <span>✋</span>
        <span>✌️</span>
      </Flipbook>
    ),
    code: (v) =>
      `import { Flipbook } from "@/components/better/flipbook"

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

  paper: {
    controls: [
      { type: "color", prop: "color", label: "Color", default: "#f4efe4" },
      { type: "number", prop: "noise", label: "Noise", min: 0, max: 1, step: 0.05, default: 0.4 },
      { type: "number", prop: "strength", label: "Strength", min: 0, max: 1, step: 0.05, default: 0.6 },
      { type: "number", prop: "radius", label: "Radius", min: 0, max: 40, default: 16, hint: "px" },
    ],
    render: (v) => (
      <Paper
        color={String(v.color)}
        noise={v.noise as number}
        strength={v.strength as number}
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
    <Paper color="${v.color}" noise={${v.noise}} strength={${v.strength}} radius={${v.radius}} className="h-48 w-72">
      <div className="p-6">Paper</div>
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
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
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
              className="size-7 cursor-pointer rounded-md border border-border/60 bg-transparent p-0.5"
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
