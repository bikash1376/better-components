"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"

import { useIcons } from "@/components/site/icons"
import { IconTooltip } from "@/components/better/icon-tooltip"
import { NotificationCard } from "@/components/better/notification-card"
import { IconWheel } from "@/components/better/icon-wheel"
import { DynamicIsland } from "@/components/better/dynamic-island"
import { InfiniteCanvas } from "@/components/better/infinite-canvas"

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
      icon={<icons.bell className="size-4" />}
      title="New notification"
      message="Someone starred your component."
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

const ISLAND_STATES = ["idle", "music", "call", "notify"] as const

function EqualizerBars() {
  return (
    <div className="flex h-4 items-end gap-0.5">
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-lime-400"
          animate={{ height: ["30%", "100%", "45%"] }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            repeatType: "mirror",
            delay: i * 0.12,
          }}
        />
      ))}
    </div>
  )
}

export function DynamicIslandDemo() {
  const { icons } = useIcons()
  const [i, setI] = useState(0)
  const state = ISLAND_STATES[i]

  useEffect(() => {
    const id = setInterval(
      () => setI((v) => (v + 1) % ISLAND_STATES.length),
      2600
    )
    return () => clearInterval(id)
  }, [])

  const next = () => setI((v) => (v + 1) % ISLAND_STATES.length)

  return (
    <DynamicIsland state={state} onClick={next} className="px-4 py-2.5">
      {state === "idle" && <span className="size-2 rounded-full bg-white/40" />}
      {state === "music" && (
        <div className="flex items-center gap-3 px-1">
          <icons.star className="size-4 text-lime-400" />
          <span className="text-sm font-medium">Now Playing</span>
          <EqualizerBars />
        </div>
      )}
      {state === "call" && (
        <div className="flex items-center gap-3 px-1">
          <span className="flex size-8 items-center justify-center rounded-full bg-white/10">
            <icons.user className="size-4" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium">Aanya</span>
            <span className="text-xs text-white/50">calling…</span>
          </div>
          <span className="ml-1 size-6 rounded-full bg-green-500" />
          <span className="size-6 rounded-full bg-red-500" />
        </div>
      )}
      {state === "notify" && (
        <div className="flex items-center gap-3 px-1">
          <icons.bell className="size-4 text-amber-300" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium">Reminder</span>
            <span className="text-xs text-white/50">Standup in 5 min</span>
          </div>
        </div>
      )}
    </DynamicIsland>
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
