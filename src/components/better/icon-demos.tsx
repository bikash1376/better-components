"use client"

import { useEffect, useState } from "react"
import { Phone, PhoneDisconnect } from "@phosphor-icons/react"

import { useIcons } from "@/components/site/icons"
import { IconTooltip } from "@/components/better/icon-tooltip"
import { NotificationCard } from "@/components/better/notification-card"
import { IconWheel } from "@/components/better/icon-wheel"
import { DynamicIsland } from "@/components/better/dynamic-island"
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

export function NotificationDemo() {
  const { icons } = useIcons()
  return (
    <NotificationCard
      icon={<icons.star className="size-4" />}
      title="New star"
      message="Someone starred your component."
      time="now"
      accent="amber"
      action={{ label: "View repo" }}
      closeIcon={<icons.close className="size-4" />}
    />
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
/* Dynamic Island                                                    */
/* ---------------------------------------------------------------- */

/** A call scenario: compact pill and the expanded accept/decline card. */
export function IslandCall({ icons }: { icons: ReturnType<typeof useIcons>["icons"] }) {
  return {
    compact: (
      <div className="flex items-center gap-2.5 px-1">
        <span className="flex size-6 items-center justify-center rounded-full bg-green-500">
          <Phone weight="fill" className="size-3.5" />
        </span>
        <span className="text-sm font-medium">Aanya</span>
        <span className="text-xs text-white/50">mobile</span>
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
  }
}

export function DynamicIslandDemo() {
  const { icons } = useIcons()
  const [open, setOpen] = useState(false)
  const call = IslandCall({ icons })

  // Auto-toggle so the gallery card animates; still clickable to expand.
  useEffect(() => {
    const id = setInterval(() => setOpen((o) => !o), 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <DynamicIsland
      open={open}
      onOpenChange={setOpen}
      compact={call.compact}
      expanded={call.expanded}
    />
  )
}

/** Static black pill for the gallery poster. */
export function DynamicIslandPoster() {
  return <span className="h-9 w-28 rounded-full bg-black" />
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
