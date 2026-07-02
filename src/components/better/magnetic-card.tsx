"use client"

import { useRef, type ReactNode } from "react"
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react"

import { cn } from "@/lib/utils"

interface MagneticCardProps {
  children: ReactNode
  className?: string
  /** Max tilt in degrees at the card's edges. */
  tilt?: number
  /** How far the card drifts toward the cursor, in px. */
  drift?: number
  /** Show the moving glare highlight. */
  glare?: boolean
}

/**
 * MagneticCard — a card that tilts in 3D toward the cursor, drifts slightly to
 * follow it, and catches a soft glare. Springs back to rest on leave.
 * Category: Mouse. Part of the Better Component library.
 */
export function MagneticCard({
  children,
  className,
  tilt = 12,
  drift = 10,
  glare = true,
}: MagneticCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  // -0.5..0.5 relative to the card centre.
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  const spring = { stiffness: 220, damping: 18, mass: 0.4 }
  const sx = useSpring(px, spring)
  const sy = useSpring(py, spring)

  const rotateX = useTransform(sy, [-0.5, 0.5], [tilt, -tilt])
  const rotateY = useTransform(sx, [-0.5, 0.5], [-tilt, tilt])
  const translateX = useTransform(sx, [-0.5, 0.5], [-drift, drift])
  const translateY = useTransform(sy, [-0.5, 0.5], [-drift, drift])

  const glareX = useTransform(sx, [-0.5, 0.5], ["0%", "100%"])
  const glareY = useTransform(sy, [-0.5, 0.5], ["0%", "100%"])
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.35), transparent 45%)`

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    px.set((e.clientX - rect.left) / rect.width - 0.5)
    py.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function reset() {
    px.set(0)
    py.set(0)
  }

  return (
    <div style={{ perspective: 800 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        style={{
          rotateX,
          rotateY,
          x: translateX,
          y: translateY,
          transformStyle: "preserve-3d",
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-lg will-change-transform",
          className
        )}
      >
        <div style={{ transform: "translateZ(40px)" }}>{children}</div>
        {glare && (
          <motion.div
            aria-hidden
            style={{ background: glareBg }}
            className="pointer-events-none absolute inset-0"
          />
        )}
      </motion.div>
    </div>
  )
}
