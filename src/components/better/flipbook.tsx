"use client"

import { Children, useEffect, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

interface FlipbookProps {
  children: ReactNode
  className?: string
  /** Frames per second — keep it low (2-8) for the stop-motion feel. */
  fps?: number
  /** Add a tiny positional jitter to each frame, like a mis-registered camera. */
  jitter?: boolean
}

/** Discrete offsets cycled per frame when jitter is on (no interpolation). */
const JITTER = [
  { x: 0, y: 0, r: 0 },
  { x: 1.2, y: -0.8, r: 0.6 },
  { x: -1, y: 0.6, r: -0.5 },
  { x: 0.6, y: 1, r: 0.4 },
]

/**
 * Flipbook — snaps between its children like pages of a flipbook, one per
 * frame, with optional camera jitter. No easing, no cross-fade: each frame
 * simply replaces the last, the way stop motion actually works.
 * Category: Stop Motion. Part of the Better Component library.
 */
export function Flipbook({
  children,
  className,
  fps = 4,
  jitter = true,
}: FlipbookProps) {
  const frames = Children.toArray(children)
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (frames.length < 2) return
    const id = setInterval(
      () => setFrame((f) => (f + 1) % frames.length),
      1000 / fps
    )
    return () => clearInterval(id)
  }, [fps, frames.length])

  const j = jitter ? JITTER[frame % JITTER.length] : JITTER[0]

  return (
    <div
      className={cn("inline-block will-change-transform", className)}
      style={{
        transform: `translate(${j.x}px, ${j.y}px) rotate(${j.r}deg)`,
      }}
    >
      {frames[frame % frames.length] ?? null}
    </div>
  )
}
