"use client"

import { useRef } from "react"

import { cn } from "@/lib/utils"

interface MarqueeProps {
  children: React.ReactNode
  className?: string
  /** Seconds for one full loop. */
  duration?: number
  /** Scroll right-to-left by default; reverse flips it. */
  reverse?: boolean
  /**
   * What hovering does. One choice, not two flags — pausing and slowing are
   * mutually exclusive, so they can't both be asked for.
   */
  hover?: "pause" | "slow" | "none"
  /** How many times slower on hover when `hover` is "slow". */
  slowFactor?: number
  /** Gap between repeated groups (any CSS length). */
  gap?: string
}

/**
 * Marquee — an infinite horizontal scroller. Content is duplicated so the
 * loop is seamless. Part of the Better Component library.
 */
export function Marquee({
  children,
  className,
  duration = 20,
  reverse = false,
  hover = "pause",
  slowFactor = 3,
  gap = "1.5rem",
}: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null)

  /** The running CSS animations of both duplicated groups. */
  function animations() {
    const el = ref.current
    if (!el) return []
    return Array.from(
      el.querySelectorAll<HTMLElement>("[data-marquee-group]")
    ).flatMap((group) => group.getAnimations())
  }

  function onEnter() {
    if (hover === "pause") {
      animations().forEach((a) => a.pause())
    } else if (hover === "slow") {
      // Retime, don't re-declare. Overriding `animation-duration` keeps the
      // elapsed time but re-maps it against the new duration, so the scroll
      // snaps backwards; playbackRate slows it from exactly where it is.
      animations().forEach((a) => a.updatePlaybackRate(1 / slowFactor))
    }
  }

  function onLeave() {
    if (hover === "none") return
    animations().forEach((a) => {
      a.updatePlaybackRate(1)
      a.play()
    })
  }

  return (
    <div
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn(
        "flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className
      )}
      style={
        {
          "--marquee-gap": gap,
          "--marquee-duration": `${duration}s`,
        } as React.CSSProperties
      }
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          data-marquee-group
          aria-hidden={i === 1}
          className={cn(
            "flex shrink-0 items-center justify-around gap-[var(--marquee-gap)] pr-[var(--marquee-gap)]",
            "min-w-full animate-[marquee_var(--marquee-duration)_linear_infinite]",
            reverse && "[animation-direction:reverse]"
          )}
        >
          {children}
        </div>
      ))}
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(calc(-100% - var(--marquee-gap))) } }`}</style>
    </div>
  )
}
