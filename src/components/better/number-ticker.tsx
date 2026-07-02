"use client"

import { useEffect, useRef } from "react"
import { useInView, useMotionValue, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

interface NumberTickerProps {
  /** Target value to count to. */
  value: number
  /** Count starts from this value. */
  from?: number
  /** Decimal places to render. */
  decimals?: number
  /** Delay before starting, in seconds. */
  delay?: number
  className?: string
  /** Prefix / suffix rendered around the number (e.g. "$", "%"). */
  prefix?: string
  suffix?: string
}

/**
 * NumberTicker — counts up (or down) to a value with a spring once it
 * scrolls into view. Part of the Better Component library.
 */
export function NumberTicker({
  value,
  from = 0,
  decimals = 0,
  delay = 0,
  className,
  prefix = "",
  suffix = "",
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(from)
  const spring = useSpring(motionValue, { damping: 60, stiffness: 100 })
  const inView = useInView(ref, { once: true, margin: "0px" })

  useEffect(() => {
    if (!inView) return
    const id = setTimeout(() => motionValue.set(value), delay * 1000)
    return () => clearTimeout(id)
  }, [inView, value, delay, motionValue])

  useEffect(() => {
    const fmt = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    return spring.on("change", (latest) => {
      if (ref.current)
        ref.current.textContent = `${prefix}${fmt.format(latest)}${suffix}`
    })
  }, [spring, decimals, prefix, suffix])

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)}>
      {`${prefix}${new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(from)}${suffix}`}
    </span>
  )
}
