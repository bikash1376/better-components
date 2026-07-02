"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

interface WheelItem {
  icon: ReactNode
  label: string
}

interface IconWheelProps {
  items: WheelItem[]
  /** Wheel radius in pixels. */
  radius?: number
  className?: string
}

/** Google-style segment colors, cycled across the items. */
const COLORS = ["#ea4335", "#4285f4", "#34a853", "#fbbc05"]

/**
 * IconWheel — a colored segment wheel of icons. Scroll while hovered to spin;
 * click to snap the top segment under the pointer and reveal its label.
 * Category: Mouse. Part of the Better Component library.
 */
export function IconWheel({ items, radius = 120, className }: IconWheelProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const rotation = useMotionValue(0)
  const smooth = useSpring(rotation, { stiffness: 120, damping: 18 })
  const [hovered, setHovered] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)

  const n = items.length
  const step = 360 / n

  useEffect(() => {
    const el = ref.current
    if (!el || !hovered) return
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      rotation.set(rotation.get() + e.deltaY * 0.3)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [hovered, rotation])

  function select() {
    const snappedSteps = Math.round(rotation.get() / step)
    rotation.set(snappedSteps * step)
    setSelected(((-snappedSteps % n) + n) % n)
  }

  const gradient = `conic-gradient(from ${-step / 2}deg, ${items
    .map((_, i) => `${COLORS[i % COLORS.length]} ${i * step}deg ${(i + 1) * step}deg`)
    .join(", ")})`

  const size = radius * 2
  const orbit = radius * 0.66

  return (
    <div
      className={cn("relative select-none", className)}
      style={{ width: size, height: size + 28 }}
    >
      {/* Pointer at top center */}
      <div className="absolute left-1/2 top-1 z-20 -translate-x-1/2">
        <div className="size-0 border-x-[9px] border-t-[15px] border-x-transparent border-t-foreground drop-shadow" />
      </div>

      {/* Selected label tooltip */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: -6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="absolute left-1/2 top-5 z-30 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow"
          >
            {items[selected].label}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={ref}
        onClick={select}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Spin the wheel"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 cursor-pointer rounded-full"
        style={{ width: size, height: size }}
      >
        <motion.div
          className="relative size-full rounded-full shadow-lg"
          style={{ rotate: smooth, background: gradient }}
        >
          {items.map((item, i) => {
            const angle = i * step
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${orbit}px) rotate(${-angle}deg)`,
                }}
              >
                <div className="flex size-9 items-center justify-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                  {item.icon}
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Center hub */}
        <div className="absolute left-1/2 top-1/2 z-10 flex size-[38%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background text-xs font-medium text-muted-foreground shadow">
          {selected !== null ? items[selected].label : "Click"}
        </div>
      </button>
    </div>
  )
}
