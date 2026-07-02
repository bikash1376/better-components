"use client"

import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface GridPulseProps {
  className?: string
  /** Grid rows. */
  rows?: number
  /** Grid columns. */
  cols?: number
  /** Dot diameter in px. */
  dotSize?: number
  /** Gap between dots in px. */
  gap?: number
  /** Dot colour (any CSS color). */
  color?: string
  /** Seconds for one cycle. */
  speed?: number
}

/**
 * GridPulse — a dot-matrix grid pulsing in a diagonal wave.
 * Category: Loaders. Part of the Better Component library.
 */
export function GridPulse({
  className,
  rows = 3,
  cols = 3,
  dotSize = 8,
  gap = 6,
  color = "currentColor",
  speed = 1.4,
}: GridPulseProps) {
  return (
    <div
      className={cn("grid w-fit", className)}
      style={{
        gap,
        gridTemplateColumns: `repeat(${cols}, ${dotSize}px)`,
      }}
    >
      {Array.from({ length: rows * cols }).map((_, i) => {
        const r = Math.floor(i / cols)
        const c = i % cols
        return (
          <motion.span
            key={i}
            className="rounded-full"
            style={{ width: dotSize, height: dotSize, backgroundColor: color }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1, 0.7] }}
            transition={{
              duration: speed,
              repeat: Infinity,
              ease: "easeInOut",
              delay: ((r + c) / (rows + cols)) * speed,
            }}
          />
        )
      })}
    </div>
  )
}
