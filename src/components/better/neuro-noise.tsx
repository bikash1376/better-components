"use client"

import { NeuroNoise as PaperNeuroNoise } from "@paper-design/shaders-react"

import { cn } from "@/lib/utils"

interface NeuroNoiseProps {
  className?: string
  /** Color of the glowing lines. */
  colorFront?: string
  /** Mid-tone color between lines and background. */
  colorMid?: string
  /** Background color. */
  colorBack?: string
  /** Animation speed multiplier (0 = frozen). */
  speed?: number
  brightness?: number
  contrast?: number
}

/**
 * NeuroNoise — a glowing web of fluid lines and soft intersections on the
 * GPU via paper.design shaders. Atmospheric, organic-yet-futuristic.
 * Category: Shaders. Part of the Better Component library.
 */
export function NeuroNoise({
  className,
  colorFront = "#c4b5fd",
  colorMid = "#4c1d95",
  colorBack = "#030712",
  speed = 0.5,
  brightness = 1.1,
  contrast = 0.9,
}: NeuroNoiseProps) {
  return (
    <PaperNeuroNoise
      className={cn("size-full", className)}
      colorFront={colorFront}
      colorMid={colorMid}
      colorBack={colorBack}
      speed={speed}
      brightness={brightness}
      contrast={contrast}
    />
  )
}
