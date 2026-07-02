"use client"

import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface DotsLoaderProps {
  className?: string
  /** Diameter of each dot in pixels. */
  size?: number
  /** Number of dots. */
  count?: number
  /** Gap between dots in pixels. */
  gap?: number
  /** Dot colour (any CSS color). Defaults to the current text colour. */
  color?: string
  /** Seconds for one full bounce cycle. */
  speed?: number
  /** How far each dot travels up, in pixels (defaults to `size`). */
  bounce?: number
}

/**
 * DotsLoader — a row of dots bouncing in sequence.
 * Category: Loaders. Part of the Better Component library.
 */
export function DotsLoader({
  className,
  size = 10,
  count = 3,
  gap = 8,
  color = "currentColor",
  speed = 0.9,
  bounce,
}: DotsLoaderProps) {
  const travel = bounce ?? size
  return (
    <div className={cn("flex items-center", className)} style={{ gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="rounded-full"
          style={{ width: size, height: size, backgroundColor: color }}
          animate={{ y: [0, -travel, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (i * speed) / (count * 1.8),
          }}
        />
      ))}
    </div>
  )
}
