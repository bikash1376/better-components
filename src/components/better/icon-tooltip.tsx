"use client"

import { useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

interface IconTooltipProps {
  icon: ReactNode
  label: string
  className?: string
}

/**
 * IconTooltip — an icon button that reveals a tooltip on hover.
 * Category: Mouse. Part of the Better Component library.
 */
export function IconTooltip({ icon, label, className }: IconTooltipProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
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
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
