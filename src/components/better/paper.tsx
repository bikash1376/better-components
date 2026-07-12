"use client"

import type { ReactNode } from "react"
import { PaperTexture } from "@paper-design/shaders-react"

import { cn } from "@/lib/utils"

interface PaperProps {
  children?: ReactNode
  className?: string
  /**
   * Optional source image. With one, the texture becomes a filter over the
   * photo (creased, printed-on-paper look); without one, it's a plain paper
   * surface in `color` / `colorFront`.
   */
  image?: string
  /** Base paper colour (the "back" of the texture). */
  color?: string
  /** Colour of the texture's ink/shadow detail. */
  colorFront?: string
  /** Sharpness of the light-to-dark transitions, 0–1. */
  contrast?: number
  /** Fine pixel grain, 0–1. */
  roughness?: number
  /** Curly fibre noise, 0–1. */
  fiber?: number
  /** Scale of the fibre noise, 0–1. */
  fiberSize?: number
  /** Cell-based crumple intensity, 0–1. */
  crumples?: number
  /** Scale of the crumple cells, 0–1. */
  crumpleSize?: number
  /** Depth of the folds, 0–1. */
  folds?: number
  /** How many folds, 1–15. */
  foldCount?: number
  /** Large-scale noise mask over the whole pattern, 0–1. */
  fade?: number
  /** Speckles, 0–1. */
  drops?: number
  /** Changes the random layout of folds, crumples, and drops. 0–1000. */
  seed?: number
  /** Corner radius in px. */
  radius?: number
}

/**
 * Paper — a realistic paper surface rendered on the GPU by the paper.design
 * PaperTexture shader: fibres, crumples, folds, speckles, and grain. Pass an
 * `image` to run the texture over a photo instead of a flat colour.
 * Category: UI. Part of the Better Component library.
 */
export function Paper({
  children,
  className,
  image,
  color = "#f4efe4",
  colorFront = "#9fadbc",
  contrast = 0.3,
  roughness = 0.4,
  fiber = 0.3,
  fiberSize = 0.2,
  crumples = 0.3,
  crumpleSize = 0.35,
  folds = 0.65,
  foldCount = 5,
  fade = 0,
  drops = 0.2,
  seed = 5.8,
  radius = 16,
}: PaperProps) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ borderRadius: radius }}
    >
      <PaperTexture
        image={image}
        colorBack={color}
        colorFront={colorFront}
        contrast={contrast}
        roughness={roughness}
        fiber={fiber}
        fiberSize={fiberSize}
        crumples={crumples}
        crumpleSize={crumpleSize}
        folds={folds}
        foldCount={foldCount}
        fade={fade}
        drops={drops}
        seed={seed}
        fit="cover"
        className="pointer-events-none absolute inset-0 size-full"
      />

      <div className="relative size-full">{children}</div>
    </div>
  )
}
