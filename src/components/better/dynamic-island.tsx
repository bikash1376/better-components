"use client"

import { type ReactNode } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

interface DynamicIslandProps {
  /**
   * Identifies the current content. Changing it morphs the island and swaps
   * the content with a blur/scale cross-fade — mirror Apple's Dynamic Island.
   */
  state: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

/**
 * DynamicIsland — a black pill that fluidly resizes to fit whatever content it
 * holds, morphing between states the way iPhone's Dynamic Island does. Drive it
 * by changing `state` (the key) and the `children` you render for that state.
 * Category: UI. Part of the Better Component library.
 */
export function DynamicIsland({
  state,
  children,
  className,
  onClick,
}: DynamicIslandProps) {
  return (
    <MotionConfig
      transition={{ type: "spring", stiffness: 400, damping: 30, mass: 1 }}
    >
      <motion.div
        layout
        onClick={onClick}
        style={{ borderRadius: 32 }}
        className={cn(
          "flex min-h-[44px] min-w-[120px] items-center justify-center overflow-hidden bg-black text-white shadow-xl",
          onClick && "cursor-pointer",
          className
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={state}
            layout="position"
            initial={{ opacity: 0, scale: 0.8, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(6px)" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex items-center"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  )
}
