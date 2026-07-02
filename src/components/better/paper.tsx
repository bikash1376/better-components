"use client"

import { useId, type ReactNode } from "react"

import { cn } from "@/lib/utils"

interface PaperProps {
  children?: ReactNode
  className?: string
  /** Base paper colour. */
  color?: string
  /** Grain intensity, 0–1. */
  noise?: number
  /** Depth of the emboss, light, and drop shadow, 0–1. */
  strength?: number
  /** Corner radius in px. */
  radius?: number
}

/**
 * Paper — a textured paper surface: a fractal-noise grain over a warm base with
 * a soft top light, embossed edges, and a lift shadow. Tune the `noise` grain
 * and the `strength` of the depth. Everything renders on the GPU-friendly SVG
 * filter; no images.
 * Category: UI. Part of the Better Component library.
 */
export function Paper({
  children,
  className,
  color = "#f4efe4",
  noise = 0.4,
  strength = 0.6,
  radius = 16,
}: PaperProps) {
  const id = useId()

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background: color,
        borderRadius: radius,
        boxShadow: [
          `inset 0 1px 1px rgba(255,255,255,${0.6 * strength})`,
          `inset 0 -1px 2px rgba(0,0,0,${0.14 * strength})`,
          `0 ${10 * strength}px ${28 * strength}px -10px rgba(0,0,0,${0.3 * strength})`,
        ].join(", "),
      }}
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full mix-blend-multiply"
        style={{ opacity: noise }}
      >
        <filter id={`paper-${id}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
            result="n"
          />
          <feColorMatrix in="n" type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#paper-${id})`} />
      </svg>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,${
            0.4 * strength
          }), transparent 60%)`,
        }}
      />

      <div className="relative">{children}</div>
    </div>
  )
}
