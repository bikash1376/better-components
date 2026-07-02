"use client"

import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface DotsLoaderProps {
  className?: string
  /** Diameter of each dot in pixels. */
  size?: number
}

/**
 * DotsLoader — three dots bouncing in sequence.
 * Category: Loaders. Part of the Better Component library.
 */
export function DotsLoader({ className, size = 10 }: DotsLoaderProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="rounded-full bg-foreground"
          style={{ width: size, height: size }}
          animate={{ y: [0, -size, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  )
}
