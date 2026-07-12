"use client"

import { useEffect, useId, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

interface SketchBorderProps {
  children: ReactNode
  className?: string
  /** Border color (any CSS color). */
  color?: string
  /** Stroke thickness in px. */
  strokeWidth?: number
  /** How wobbly the line is. */
  roughness?: number
  /** Redraws (re-seeds) per second — the classic "line boil". */
  fps?: number
  /** Corner radius of the underlying rect. */
  radius?: number
}

/**
 * SketchBorder — wraps content in a hand-drawn border that "boils": the
 * wobble is re-seeded a few times a second, like ink redrawn every frame.
 * Category: Hand Drawn. Part of the Better Component library.
 */
export function SketchBorder({
  children,
  className,
  color = "currentColor",
  strokeWidth = 2,
  roughness = 4,
  fps = 4,
  radius = 10,
}: SketchBorderProps) {
  const id = useId()
  const [seed, setSeed] = useState(1)

  useEffect(() => {
    const t = setInterval(() => setSeed((s) => (s % 90) + 7), 1000 / fps)
    return () => clearInterval(t)
  }, [fps])

  const pad = strokeWidth + roughness
  return (
    <div className={cn("relative inline-block", className)} style={{ padding: pad + 6 }}>
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        <defs>
          <filter id={`sketch-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.045"
              numOctaves="2"
              seed={seed}
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale={roughness * 2}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <rect
          x={pad / 2}
          y={pad / 2}
          width={`calc(100% - ${pad}px)`}
          height={`calc(100% - ${pad}px)`}
          rx={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter={`url(#sketch-${id})`}
        />
      </svg>
      {children}
    </div>
  )
}
