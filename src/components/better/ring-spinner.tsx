"use client"

import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface RingSpinnerProps {
  className?: string
  /** Outer diameter in px. */
  size?: number
  /** Stroke thickness in px. */
  thickness?: number
  /** Arc colour (any CSS color). */
  color?: string
  /** Fraction of the ring the moving arc covers, 0–1. */
  arc?: number
  /** Seconds per rotation. */
  speed?: number
}

/**
 * RingSpinner — a track ring with a rotating arc sweeping around it.
 * Category: Loaders. Part of the Better Component library.
 */
export function RingSpinner({
  className,
  size = 40,
  thickness = 4,
  color = "currentColor",
  arc = 0.25,
  speed = 0.9,
}: RingSpinnerProps) {
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r

  return (
    <motion.svg
      className={cn("block", className)}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      animate={{ rotate: 360 }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        opacity={0.2}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - arc)}
      />
    </motion.svg>
  )
}
