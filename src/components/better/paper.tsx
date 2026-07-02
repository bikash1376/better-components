"use client"

import { useId, type ReactNode } from "react"

import { cn } from "@/lib/utils"

type Edge = "straight" | "handdrawn" | "torn" | "cutout"

interface PaperProps {
  children?: ReactNode
  className?: string
  /** Base paper colour. */
  color?: string
  /** Speckled grain intensity, 0–1. */
  grain?: number
  /** Directional fibre streaks, 0–1. */
  fibers?: number
  /** Depth of the emboss, light, and drop shadow, 0–1. */
  strength?: number
  /** Corner radius in px (used when edge is straight/handdrawn). */
  radius?: number
  /** Edge treatment. */
  edge?: Edge
  /** Extra edge distortion added on top of the edge preset. */
  distort?: number
}

/** feTurbulence + feDisplacementMap presets that rough up the paper's outline. */
const EDGE: Record<Edge, { freq: string; scale: number } | null> = {
  straight: null,
  handdrawn: { freq: "0.02", scale: 4 },
  torn: { freq: "0.014", scale: 11 },
  cutout: { freq: "0.05", scale: 6 },
}

/**
 * Paper — a textured paper surface. A speckled fractal-noise grain plus
 * directional fibres over a warm base, with a soft top light, embossed edges,
 * and a lift shadow. `edge` roughens the outline (hand-drawn, torn, or cutout)
 * by displacing the surface with noise. All SVG filters, no images.
 * Category: UI. Part of the Better Component library.
 */
export function Paper({
  children,
  className,
  color = "#f4efe4",
  grain = 0.4,
  fibers = 0.25,
  strength = 0.6,
  radius = 16,
  edge = "straight",
  distort = 0,
}: PaperProps) {
  const id = useId()
  const edgePreset = EDGE[edge]
  const ragged = edge === "torn" || edge === "cutout"

  return (
    <div className={cn("relative", className)}>
      {/* Hidden filter defs. */}
      <svg aria-hidden width={0} height={0} className="absolute">
        <defs>
          {edgePreset && (
            <filter id={`edge-${id}`}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency={edgePreset.freq}
                numOctaves="2"
                result="e"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="e"
                scale={edgePreset.scale + distort}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          )}
        </defs>
      </svg>

      {/* Textured surface (displaced as one layer, so grain + edge move together). */}
      <div
        className="absolute inset-0"
        style={{
          background: color,
          borderRadius: ragged ? 0 : radius,
          filter: edgePreset ? `url(#edge-${id})` : undefined,
          boxShadow: [
            `inset 0 1px 1px rgba(255,255,255,${0.6 * strength})`,
            `inset 0 -1px 2px rgba(0,0,0,${0.14 * strength})`,
            `0 ${10 * strength}px ${28 * strength}px -10px rgba(0,0,0,${0.3 * strength})`,
          ].join(", "),
        }}
      >
        {/* Speckled grain. */}
        <svg
          aria-hidden
          className="absolute inset-0 size-full mix-blend-multiply"
          style={{ opacity: grain }}
        >
          <filter id={`grain-${id}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              stitchTiles="stitch"
              result="n"
            />
            <feColorMatrix in="n" type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grain-${id})`} />
        </svg>

        {/* Directional fibres. */}
        <svg
          aria-hidden
          className="absolute inset-0 size-full mix-blend-multiply"
          style={{ opacity: fibers }}
        >
          <filter id={`fiber-${id}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.4"
              numOctaves="2"
              stitchTiles="stitch"
              result="f"
            />
            <feColorMatrix in="f" type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#fiber-${id})`} />
        </svg>

        {/* Soft top light. */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,${
              0.4 * strength
            }), transparent 60%)`,
          }}
        />
      </div>

      <div className="relative">{children}</div>
    </div>
  )
}
