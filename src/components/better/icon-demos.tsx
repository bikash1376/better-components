"use client"

import {
  BellIcon,
  CodeIcon,
  EnvelopeIcon,
  GearIcon,
  HeartIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  StarIcon,
  UserIcon,
} from "@phosphor-icons/react"

import { IconTooltip } from "@/components/better/icon-tooltip"
import { IconWheel } from "@/components/better/icon-wheel"
import { InfiniteCanvas } from "@/components/better/infinite-canvas"
import { Toaster, toast } from "@/components/better/toast"

/** Demo wrappers for the components that need a handful of icons to show off. */

const WHEEL_ITEMS = [
  { Icon: HouseIcon, label: "Home" },
  { Icon: UserIcon, label: "User" },
  { Icon: BellIcon, label: "Bell" },
  { Icon: HeartIcon, label: "Heart" },
  { Icon: GearIcon, label: "Settings" },
  { Icon: MagnifyingGlassIcon, label: "Search" },
]

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

export function IconTooltipDemo() {
  return <IconTooltip icon={<GearIcon className="size-5" />} label="Settings" />
}

export function IconWheelDemo() {
  return (
    <IconWheel
      radius={120}
      items={WHEEL_ITEMS.map(({ Icon, label }) => ({
        icon: <Icon className="size-5" />,
        label,
      }))}
    />
  )
}

/** Compact static-ish wheel for the gallery card. */
export function IconWheelPoster() {
  return (
    <IconWheel
      radius={64}
      items={WHEEL_ITEMS.map(({ Icon, label }) => ({
        icon: <Icon className="size-3.5" />,
        label,
      }))}
    />
  )
}

/* ---------------------------------------------------------------- */
/* Infinite Canvas                                                   */
/* ---------------------------------------------------------------- */

export function InfiniteCanvasDemo() {
  const items = CANVAS_ICONS.map((Icon, i) => (
    <Icon key={i} className="size-6" />
  ))
  return <InfiniteCanvas items={items} className="h-40 w-full" cellSize={80} />
}

/* ---------------------------------------------------------------- */
/* Toast                                                             */
/* ---------------------------------------------------------------- */

export function ToastDemo() {
  const btn =
    "cursor-pointer rounded-lg border border-border bg-card px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        className={btn}
        onClick={() =>
          toast.success("Saved", { description: "Your changes are live." })
        }
      >
        Success
      </button>
      <button
        className={btn}
        onClick={() =>
          toast.error("Couldn't save", { description: "Please try again." })
        }
      >
        Error
      </button>
      <button
        className={btn}
        onClick={() =>
          toast.info("Update available", {
            description: "Reload to get the latest.",
            action: { label: "Reload", onClick: () => {} },
          })
        }
      >
        Info
      </button>
      <Toaster position="bottom-right" />
    </div>
  )
}

/** Static stacked cards for the gallery poster. */
export function ToastPoster() {
  return (
    <div className="relative h-20 w-64">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute inset-x-0 mx-auto rounded-2xl border border-border bg-card shadow-md"
          style={{
            bottom: i * 8,
            height: 44,
            width: `${100 - i * 6}%`,
            opacity: 1 - i * 0.25,
          }}
        />
      ))}
    </div>
  )
}

/** Static tile grid for the gallery poster (no drag handlers, no springs). */
export function InfiniteCanvasPoster() {
  const grid = [
    HouseIcon,
    HeartIcon,
    StarIcon,
    BellIcon,
    UserIcon,
    EnvelopeIcon,
  ]
  return (
    <div className="grid grid-cols-3 gap-3">
      {grid.map((Icon, i) => (
        <span
          key={i}
          className="flex size-12 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground"
        >
          <Icon className="size-5" />
        </span>
      ))}
    </div>
  )
}
