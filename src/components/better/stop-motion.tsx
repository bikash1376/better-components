"use client"

import { useEffect, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

interface StopMotionProps {
  children: ReactNode
  className?: string
  /** Frames per second — lower is choppier / more hand-made. */
  fps?: number
}

/** Discrete jitter frames that snap (no interpolation) for a stop-motion "boil". */
const FRAMES = [
  { rotate: -1.5, x: -1, y: 0.5 },
  { rotate: 1.2, x: 1, y: -0.8 },
  { rotate: -0.5, x: -0.6, y: 1 },
  { rotate: 1.6, x: 0.8, y: -0.4 },
]

/**
 * StopMotion — wraps content and jumps between discrete frames, giving the
 * choppy, hand-animated "boil" of stop-motion. Snaps between frames (no easing).
 * Category: Typography. Part of the Better Component library.
 */
export function StopMotion({ children, className, fps = 8 }: StopMotionProps) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const id = setInterval(
      () => setFrame((f) => (f + 1) % FRAMES.length),
      1000 / fps
    )
    return () => clearInterval(id)
  }, [fps])

  const f = FRAMES[frame]

  return (
    <div
      className={cn("inline-block will-change-transform", className)}
      style={{
        transform: `translate(${f.x}px, ${f.y}px) rotate(${f.rotate}deg)`,
      }}
    >
      {children}
    </div>
  )
}
