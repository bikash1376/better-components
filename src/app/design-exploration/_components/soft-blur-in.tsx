"use client"

import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

/**
 * Per-character fade-in with a gentle blur and upward motion — the effect from
 * remocn's SoftBlurIn, ported from Remotion to motion. The original is driven
 * by `useCurrentFrame()` for video rendering; this runs on a real timeline.
 *
 * remocn's fontSize/fontWeight/color props are dropped: Remotion compositions
 * have no ambient CSS, so it must take them. Here, style with `className`.
 */
export function SoftBlurIn({
  text,
  blur = 12,
  delay = 0,
  /** Seconds between one character's start and the next. */
  stagger = 0.03,
  className,
}: {
  text: string
  blur?: number
  delay?: number
  stagger?: number
  className?: string
}) {
  const reduced = useReducedMotion()

  return (
    // The split is decorative: screen readers get the intact string from
    // aria-label, never the pile of per-character spans.
    <span aria-label={text} className={cn("inline-block", className)}>
      {Array.from(text).map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          aria-hidden
          initial={
            reduced
              ? { opacity: 0 }
              : { opacity: 0, filter: `blur(${blur}px)`, y: "0.25em" }
          }
          animate={
            reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", y: 0 }
          }
          transition={{
            duration: reduced ? 0.3 : 0.9,
            delay: reduced ? 0 : delay + i * stagger,
            ease: [0.22, 1, 0.36, 1],
          }}
          // whitespace-pre keeps the spaces: an inline-block span would
          // otherwise collapse them and close up the word gaps.
          className="inline-block whitespace-pre will-change-[filter,transform,opacity]"
        >
          {char}
        </motion.span>
      ))}
    </span>
  )
}
