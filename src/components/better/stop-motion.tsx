"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

interface StopMotionProps {
  children: ReactNode
  className?: string
  /** Frames per second — lower is choppier / more hand-made. */
  fps?: number
  /** Peak rotation at either end of the boil, in degrees. */
  rotate?: number
  /** Peak positional wobble, in px. */
  shift?: number
  /** How many discrete frames the boil cycles through (2–8). */
  steps?: number
}

/**
 * Unit frames: rotation and offsets in the range -1…1, scaled by `rotate` and
 * `shift`. Hand-picked rather than random so the cycle never drifts or lands
 * twice in the same place.
 */
const UNIT_FRAMES = [
  { rotate: -1, x: -0.7, y: 0.35 },
  { rotate: 0.8, x: 0.7, y: -0.55 },
  { rotate: -0.35, x: -0.4, y: 0.7 },
  { rotate: 1, x: 0.55, y: -0.3 },
  { rotate: -0.75, x: 0.3, y: 0.6 },
  { rotate: 0.45, x: -0.8, y: -0.5 },
  { rotate: -1, x: 0.6, y: 0.2 },
  { rotate: 0.9, x: -0.35, y: -0.7 },
]

/**
 * StopMotion — wraps content and jumps between discrete frames, giving the
 * choppy, hand-animated "boil" of stop-motion. Snaps between frames (no
 * easing). `rotate` and `shift` set how far it swings at either end.
 * Category: Typography. Part of the Better Component library.
 */
export function StopMotion({
  children,
  className,
  fps = 8,
  rotate = 1.5,
  shift = 1,
  steps = 4,
}: StopMotionProps) {
  const frames = useMemo(() => {
    const count = Math.min(Math.max(Math.round(steps), 2), UNIT_FRAMES.length)
    return UNIT_FRAMES.slice(0, count).map((f) => ({
      rotate: f.rotate * rotate,
      x: f.x * shift,
      y: f.y * shift,
    }))
  }, [rotate, shift, steps])

  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const id = setInterval(
      () => setFrame((f) => (f + 1) % frames.length),
      1000 / fps
    )
    return () => clearInterval(id)
  }, [fps, frames.length])

  const f = frames[frame % frames.length]

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
