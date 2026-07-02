"use client"

import { useIcons } from "@/components/site/icons"
import { IconTooltip } from "@/components/better/icon-tooltip"
import { IconWheel } from "@/components/better/icon-wheel"
import { InfiniteCanvas } from "@/components/better/infinite-canvas"
import { Toaster, toast } from "@/components/better/toast"

/**
 * Demo wrappers that feed icons from the currently-selected icon library into
 * each component, so switching libraries visibly changes the rendered icons.
 */

export function IconTooltipDemo() {
  const { icons } = useIcons()
  return (
    <IconTooltip icon={<icons.settings className="size-5" />} label="Settings" />
  )
}

function useWheelItems() {
  const { icons } = useIcons()
  return [
    { Icon: icons.home, label: "Home" },
    { Icon: icons.user, label: "User" },
    { Icon: icons.bell, label: "Bell" },
    { Icon: icons.heart, label: "Heart" },
    { Icon: icons.settings, label: "Settings" },
    { Icon: icons.search, label: "Search" },
  ]
}

export function IconWheelDemo() {
  const items = useWheelItems()
  return (
    <IconWheel
      radius={120}
      items={items.map(({ Icon, label }) => ({
        icon: <Icon className="size-5" />,
        label,
      }))}
    />
  )
}

/** Compact static-ish wheel for the gallery card. */
export function IconWheelPoster() {
  const items = useWheelItems()
  return (
    <IconWheel
      radius={64}
      items={items.map(({ Icon, label }) => ({
        icon: <Icon className="size-3.5" />,
        label,
      }))}
    />
  )
}

/* ---------------------------------------------------------------- */
/* Infinite Canvas                                                   */
/* ---------------------------------------------------------------- */

function useCanvasIcons() {
  const { icons } = useIcons()
  const set = [
    icons.home,
    icons.user,
    icons.bell,
    icons.heart,
    icons.star,
    icons.settings,
    icons.search,
    icons.mail,
    icons.code,
  ]
  return set.map((Icon, i) => <Icon key={i} className="size-6" />)
}

export function InfiniteCanvasDemo() {
  const items = useCanvasIcons()
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
  const { icons } = useIcons()
  const grid = [icons.home, icons.heart, icons.star, icons.bell, icons.user, icons.mail]
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
