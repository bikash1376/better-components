"use client"

import { cn } from "@/lib/utils"

interface MarqueeProps {
  children: React.ReactNode
  className?: string
  /** Seconds for one full loop. */
  duration?: number
  /** Scroll right-to-left by default; reverse flips it. */
  reverse?: boolean
  /** Pause the scroll while hovered. */
  pauseOnHover?: boolean
  /** Slow the scroll while hovered (ignored if `pauseOnHover` is set). */
  slowOnHover?: boolean
  /** How many times slower on hover when `slowOnHover` is on. */
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
  pauseOnHover = true,
  slowOnHover = false,
  slowFactor = 3,
  gap = "1.5rem",
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className
      )}
      style={
        {
          "--marquee-gap": gap,
          "--marquee-duration": `${duration}s`,
          "--marquee-slow": `${duration * slowFactor}s`,
        } as React.CSSProperties
      }
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1}
          className={cn(
            "flex shrink-0 items-center justify-around gap-[var(--marquee-gap)] pr-[var(--marquee-gap)]",
            "min-w-full animate-[marquee_var(--marquee-duration)_linear_infinite]",
            reverse && "[animation-direction:reverse]",
            slowOnHover && "group-hover:[animation-duration:var(--marquee-slow)]",
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
        >
          {children}
        </div>
      ))}
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(calc(-100% - var(--marquee-gap))) } }`}</style>
    </div>
  )
}
