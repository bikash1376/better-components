"use client"

import { MeshGradient as PaperMeshGradient } from "@paper-design/shaders-react"

import { cn } from "@/lib/utils"

interface MeshGradientProps {
  className?: string
  /** 2-10 colors blended across the mesh. */
  colors?: string[]
  /** Animation speed multiplier (0 = frozen). */
  speed?: number
  /** How much the color spots warp (0-1). */
  distortion?: number
  /** Swirling of the whole field (0-1). */
  swirl?: number
}

/**
 * MeshGradient — a flowing, animated multi-color gradient rendered on the
 * GPU via paper.design shaders. Use it as a hero/card background.
 * Category: Shaders. Part of the Better Component library.
 */
export function MeshGradient({
  className,
  colors = ["#5b21b6", "#1d4ed8", "#0ea5e9", "#e879f9"],
  speed = 0.6,
  distortion = 0.8,
  swirl = 0.6,
}: MeshGradientProps) {
  return (
    <PaperMeshGradient
      className={cn("size-full", className)}
      colors={colors}
      speed={speed}
      distortion={distortion}
      swirl={swirl}
    />
  )
}
