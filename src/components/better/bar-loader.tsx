"use client"

import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface BarLoaderProps {
  className?: string
  /** Number of bars. */
  count?: number
  /** Bar width in px. */
  width?: number
  /** Max bar height in px. */
  height?: number
  /** Gap between bars in px. */
  gap?: number
  /** Bar colour (any CSS color). */
  color?: string
  /** Seconds for one cycle. */
  speed?: number
}

/**
 * BarLoader — an equalizer of bars rising and falling in a wave.
 * Category: Loaders. Part of the Better Component library.
 */
export function BarLoader({
  className,
  count = 5,
  width = 4,
  height = 28,
  gap = 4,
  color = "currentColor",
  speed = 1,
}: BarLoaderProps) {
  return (
    <div
      className={cn("flex items-center", className)}
      style={{ gap, height }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          className="rounded-full"
          key={i}
          style={{ width, height, backgroundColor: color, originY: 1 }}
          animate={{ scaleY: [0.25, 1, 0.25] }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (i / count) * speed,
          }}
        />
      ))}
    </div>
  )
}
