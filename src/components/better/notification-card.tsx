"use client"

import { type ReactNode } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface NotificationCardProps {
  icon: ReactNode
  title: string
  message: string
  closeIcon?: ReactNode
  className?: string
}

/**
 * NotificationCard — a toast-style notification with a leading icon.
 * Category: Mouse. Part of the Better Component library.
 */
export function NotificationCard({
  icon,
  title,
  message,
  closeIcon,
  className,
}: NotificationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "flex w-72 items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-lg",
        className
      )}
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{message}</p>
      </div>
      {closeIcon && (
        <button
          aria-label="Dismiss"
          className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
        >
          {closeIcon}
        </button>
      )}
    </motion.div>
  )
}
