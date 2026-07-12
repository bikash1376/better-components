"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"

import { CommandBadge } from "@/components/site/command-badge"

interface CommandWithTooltipProps {
  command: string
  name: string
  description: string
}

/**
 * The install command with a tooltip (name + description) that follows the
 * cursor while hovering the command.
 */
export function CommandWithTooltip({
  command,
  name,
  description,
}: CommandWithTooltipProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  return (
    <div
      // min-w-0 so the badge can shrink inside the top bar's flex row.
      className="min-w-0"
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setPos(null)}
    >
      <CommandBadge command={command} />

      <AnimatePresence>
        {pos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.12 }}
            style={{ position: "fixed", left: pos.x + 16, top: pos.y + 16 }}
            className="pointer-events-none z-50 w-56 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-xl"
          >
            <p className="text-sm font-medium">{name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
