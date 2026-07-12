"use client"

import { Children, useEffect, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

interface FlipbookProps {
  /** Text/emoji frames — one child per frame. Ignored when `images` is set. */
  children?: ReactNode
  /**
   * Image frames, one src per frame. Give every image the SAME width and
   * height (a square source, e.g. 256×256) — frames are drawn into a square
   * `size`×`size` box, so mismatched aspect ratios get cropped and the
   * flipbook appears to wobble between frames.
   */
  images?: string[]
  /** Alt text for image frames (the whole sequence reads as one image). */
  alt?: string
  /** Side of the square frame box, in px. Only applies to image frames. */
  size?: number
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
 * Flipbook — snaps between its frames like pages of a flipbook, one per frame,
 * with optional camera jitter. No easing, no cross-fade: each frame simply
 * replaces the last, the way stop motion actually works. Frames can be
 * text/emoji children or a list of square `images`.
 * Category: Stop Motion. Part of the Better Component library.
 */
export function Flipbook({
  children,
  images,
  alt = "",
  size = 96,
  className,
  fps = 4,
  jitter = true,
}: FlipbookProps) {
  const frames: ReactNode[] = images?.length
    ? images.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={alt}
          width={size}
          height={size}
          draggable={false}
          // Every frame fills the same square box, so the sequence stays
          // registered even if a src sneaks in at the wrong aspect ratio.
          className="size-full select-none object-cover"
        />
      ))
    : Children.toArray(children)

  const [frame, setFrame] = useState(0)

  // A shorter sequence must not leave `frame` pointing past the end.
  const index = frames.length ? frame % frames.length : 0

  useEffect(() => {
    if (frames.length < 2) return
    const id = setInterval(
      () => setFrame((f) => (f + 1) % frames.length),
      1000 / fps
    )
    return () => clearInterval(id)
  }, [fps, frames.length])

  const j = jitter ? JITTER[index % JITTER.length] : JITTER[0]

  return (
    <div
      className={cn("inline-block will-change-transform", className)}
      style={{
        transform: `translate(${j.x}px, ${j.y}px) rotate(${j.r}deg)`,
        ...(images?.length ? { width: size, height: size } : null),
      }}
    >
      {frames[index] ?? null}
    </div>
  )
}
