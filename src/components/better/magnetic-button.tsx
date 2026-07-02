"use client"

import { useRef, type ReactNode } from "react"
import { motion, useMotionValue, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  /** How strongly the button follows the cursor (0–1). */
  strength?: number
}

/**
 * MagneticButton — pulls toward the cursor on hover.
 * Category: Mouse. Part of the Better Component library.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.4,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 15 })
  const springY = useSpring(y, { stiffness: 200, damping: 15 })

  function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    x.set(relX * strength)
    y.set(relY * strength)
  }

  function reset() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className={cn(
        "rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background",
        className
      )}
    >
      {children}
    </motion.button>
  )
}
