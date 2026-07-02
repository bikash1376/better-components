"use client"

import { useState, type ReactNode } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

interface DynamicIslandProps {
  /** The collapsed pill content. */
  compact: ReactNode
  /** The expanded card content. When provided, clicking the island toggles it. */
  expanded?: ReactNode
  /** Start expanded (uncontrolled). */
  defaultOpen?: boolean
  /** Controlled open state. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

const spring = { type: "spring" as const, stiffness: 400, damping: 30, mass: 1 }

/**
 * DynamicIsland — an iPhone / Android-16 style black pill that fluidly resizes
 * and morphs from a compact pill into an expanded card when tapped. Pass the
 * collapsed content as `compact` and the open content as `expanded`; clicking
 * toggles between them (or drive it yourself with `open` / `onOpenChange`).
 * Category: UI. Part of the Better Component library.
 */
export function DynamicIsland({
  compact,
  expanded,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  className,
}: DynamicIslandProps) {
  const [internal, setInternal] = useState(defaultOpen)
  const controlled = openProp !== undefined
  const open = controlled ? openProp : internal
  const canExpand = expanded != null

  function toggle() {
    if (!canExpand) return
    const next = !open
    if (!controlled) setInternal(next)
    onOpenChange?.(next)
  }

  return (
    <MotionConfig transition={spring}>
      <motion.div
        layout
        onClick={toggle}
        animate={{ borderRadius: open ? 34 : 40 }}
        className={cn(
          "flex min-h-[44px] min-w-[132px] items-center justify-center overflow-hidden bg-black text-white shadow-xl",
          open ? "p-4" : "px-4 py-2.5",
          canExpand && "cursor-pointer",
          className
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={open ? "expanded" : "compact"}
            layout="position"
            initial={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {open ? expanded : compact}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  )
}
