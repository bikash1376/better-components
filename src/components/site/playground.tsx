"use client"

import { useMemo, useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIcons } from "@/components/site/icons"
import { CodeBlock } from "@/components/site/code-block"
import { StaticButton } from "@/components/better/static-button"
import { MagneticCard } from "@/components/better/magnetic-card"
import { DynamicIsland } from "@/components/better/dynamic-island"
import { InfiniteCanvas } from "@/components/better/infinite-canvas"

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

interface PlaygroundConfig {
  controls: Control[]
  render: (v: Values) => ReactNode
  code: (v: Values) => string
}

/* ----------------------------------------------------------------- */
/* Previews that need hooks live as their own components              */
/* ----------------------------------------------------------------- */

function IslandPreview({ state }: { state: string }) {
  const { icons } = useIcons()
  return (
    <DynamicIsland state={state} className="px-4 py-2.5">
      {state === "idle" && <span className="size-2 rounded-full bg-white/40" />}
      {state === "music" && (
        <div className="flex items-center gap-3 px-1">
          <icons.star className="size-4 text-lime-400" />
          <span className="text-sm font-medium">Now Playing</span>
        </div>
      )}
      {state === "call" && (
        <div className="flex items-center gap-3 px-1">
          <icons.user className="size-4" />
          <span className="text-sm font-medium">Aanya</span>
          <span className="size-5 rounded-full bg-green-500" />
          <span className="size-5 rounded-full bg-red-500" />
        </div>
      )}
      {state === "notify" && (
        <div className="flex items-center gap-3 px-1">
          <icons.bell className="size-4 text-amber-300" />
          <span className="text-sm font-medium">Standup in 5 min</span>
        </div>
      )}
    </DynamicIsland>
  )
}

function CanvasPreview({ cellSize, overscan }: { cellSize: number; overscan: number }) {
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
      { type: "boolean", prop: "disabled", label: "Disabled", default: false },
    ],
    render: (v) => (
      <StaticButton
        variant={v.variant as "primary" | "secondary" | "outline" | "ghost"}
        size={v.size as "sm" | "md" | "lg"}
        disabled={v.disabled as boolean}
      >
        {String(v.label)}
      </StaticButton>
    ),
    code: (v) =>
      `import { StaticButton } from "@/components/better/static-button"

export function Example() {
  return (
    <StaticButton variant="${v.variant}" size="${v.size}"${
      v.disabled ? " disabled" : ""
    }>
      ${v.label}
    </StaticButton>
  )
}`,
  },

  "magnetic-card": {
    controls: [
      { type: "number", prop: "tilt", label: "Tilt", min: 0, max: 30, default: 12, hint: "deg" },
      { type: "number", prop: "drift", label: "Drift", min: 0, max: 40, default: 10, hint: "px" },
      { type: "boolean", prop: "glare", label: "Glare", default: true },
    ],
    render: (v) => (
      <MagneticCard
        tilt={v.tilt as number}
        drift={v.drift as number}
        glare={v.glare as boolean}
        className="w-64"
      >
        <h3 className="text-lg font-medium">Magnetic Card</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Move your cursor across me.
        </p>
      </MagneticCard>
    ),
    code: (v) =>
      `import { MagneticCard } from "@/components/better/magnetic-card"

export function Example() {
  return (
    <MagneticCard tilt={${v.tilt}} drift={${v.drift}} glare={${v.glare}} className="w-64">
      <h3 className="text-lg font-medium">Magnetic Card</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Move your cursor across me.
      </p>
    </MagneticCard>
  )
}`,
  },

  "dynamic-island": {
    controls: [
      {
        type: "select",
        prop: "state",
        label: "State",
        default: "music",
        options: [
          { label: "Idle", value: "idle" },
          { label: "Music", value: "music" },
          { label: "Call", value: "call" },
          { label: "Notify", value: "notify" },
        ],
      },
    ],
    render: (v) => <IslandPreview state={String(v.state)} />,
    code: (v) =>
      `import { DynamicIsland } from "@/components/better/dynamic-island"

export function Example() {
  return (
    <DynamicIsland state="${v.state}" className="px-4 py-2.5">
      {/* render whatever content this state should show */}
      <span className="text-sm font-medium">${v.state}</span>
    </DynamicIsland>
  )
}`,
  },

  "infinite-canvas": {
    controls: [
      { type: "number", prop: "cellSize", label: "Cell Size", min: 60, max: 140, default: 88, hint: "px" },
      { type: "number", prop: "overscan", label: "Overscan", min: 0, max: 3, default: 1, hint: "cells" },
    ],
    render: (v) => (
      <CanvasPreview
        cellSize={v.cellSize as number}
        overscan={v.overscan as number}
      />
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
