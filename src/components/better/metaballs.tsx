"use client"

import { Metaballs as PaperMetaballs } from "@paper-design/shaders-react"

import { cn } from "@/lib/utils"

interface MetaballsProps {
  className?: string
  /** Blob colors (blended where they merge). */
  colors?: string[]
  /** Background color. */
  colorBack?: string
  /** Number of blobs (up to 20). */
  count?: number
  /** Blob size (0-1). */
  size?: number
  /** Animation speed multiplier (0 = frozen). */
  speed?: number
}

/**
 * Metaballs — gooey blobs drifting around the center and merging into
 * smooth organic shapes, rendered on the GPU via paper.design shaders.
 * Category: Shaders. Part of the Better Component library.
 */
export function Metaballs({
  className,
  colors = ["#f43f5e", "#fb923c", "#facc15"],
  colorBack = "#030712",
  count = 8,
  size = 0.85,
  speed = 0.8,
}: MetaballsProps) {
  return (
    <PaperMetaballs
      className={cn("size-full", className)}
      colors={colors}
      colorBack={colorBack}
      count={count}
      size={size}
      speed={speed}
    />
  )
}
