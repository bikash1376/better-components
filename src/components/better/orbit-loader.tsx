"use client"

import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface OrbitLoaderProps {
  className?: string
  /** Diameter of the orbit in px. */
  size?: number
  /** Number of dots on the orbit. */
  count?: number
  /** Diameter of each dot in px. */
  dotSize?: number
  /** Dot colour (any CSS color). */
  color?: string
  /** Seconds per revolution. */
  speed?: number
}

/**
 * OrbitLoader — dots circling a shared centre.
 * Category: Loaders. Part of the Better Component library.
 */
export function OrbitLoader({
  className,
  size = 40,
  count = 3,
  dotSize = 8,
  color = "currentColor",
  speed = 1.2,
}: OrbitLoaderProps) {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 2 * Math.PI
        const r = (size - dotSize) / 2
        const x = size / 2 + r * Math.cos(angle) - dotSize / 2
        const y = size / 2 + r * Math.sin(angle) - dotSize / 2
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width: dotSize,
              height: dotSize,
              left: x,
              top: y,
              backgroundColor: color,
              opacity: 0.4 + (0.6 * (i + 1)) / count,
            }}
          />
        )
      })}
    </motion.div>
  )
}
