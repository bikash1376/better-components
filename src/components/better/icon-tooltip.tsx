"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

type Side = "top" | "bottom" | "left" | "right"

interface IconTooltipProps {
  icon: ReactNode
  label: string
  className?: string
  /** Which side the tooltip appears on. */
  side?: Side
  /** Delay before it appears, in ms. */
  delay?: number
  /** Auto-hide after this many ms once shown (0 = stay until mouse leaves). */
  duration?: number
}

const POSITION: Record<Side, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
}

const OFFSET: Record<Side, { x: number; y: number }> = {
  top: { x: 0, y: 4 },
  bottom: { x: 0, y: -4 },
  left: { x: 4, y: 0 },
  right: { x: -4, y: 0 },
}

/**
 * IconTooltip — an icon button that reveals a tooltip on hover. Configure which
 * `side` it appears on and how long to wait (`delay`) before showing.
 * Category: Mouse. Part of the Better Component library.
 */
export function IconTooltip({
  icon,
  label,
  className,
  side = "top",
  delay = 0,
  duration = 0,
}: IconTooltipProps) {
  const [open, setOpen] = useState(false)
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function show() {
    if (showTimer.current) clearTimeout(showTimer.current)
    showTimer.current = setTimeout(() => setOpen(true), delay)
  }
  function hide() {
    if (showTimer.current) clearTimeout(showTimer.current)
    setOpen(false)
  }

  // Auto-hide once shown, even if the pointer is still over the button. Keyed
  // on `open` so the countdown restarts with each reveal, and on `duration` so
  // dragging the control re-arms it instead of using a stale value.
  useEffect(() => {
    if (!open || duration <= 0) return
    const id = setTimeout(() => setOpen(false), duration)
    return () => clearTimeout(id)
  }, [open, duration])

  useEffect(() => {
    return () => {
      if (showTimer.current) clearTimeout(showTimer.current)
    }
  }, [])

  const offset = OFFSET[side]

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button
        className={cn(
          "inline-flex size-12 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-foreground/80 transition-colors hover:text-foreground",
          className
        )}
      >
        {icon}
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9, ...offset }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, ...offset }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "pointer-events-none absolute z-10 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background",
              POSITION[side]
            )}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
