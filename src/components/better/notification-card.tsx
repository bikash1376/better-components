"use client"

import { type ReactNode } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

type Accent = "neutral" | "blue" | "emerald" | "amber" | "rose"

interface NotificationCardProps {
  icon?: ReactNode
  title: string
  message?: string
  /** Small trailing timestamp, e.g. "now", "2m". */
  time?: string
  /** Colour of the leading icon chip. */
  accent?: Accent
  /** Optional action shown under the message. */
  action?: { label: string; onClick?: () => void }
  closeIcon?: ReactNode
  onClose?: () => void
  className?: string
}

const ACCENT: Record<Accent, string> = {
  neutral: "bg-muted text-foreground",
  blue: "bg-blue-500/15 text-blue-500",
  emerald: "bg-emerald-500/15 text-emerald-500",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/15 text-rose-500",
}

const ACCENT_TEXT: Record<Accent, string> = {
  neutral: "text-foreground",
  blue: "text-blue-500",
  emerald: "text-emerald-500",
  amber: "text-amber-600 dark:text-amber-400",
  rose: "text-rose-500",
}

/**
 * NotificationCard — a springy, physics-flavoured toast (inspired by Sileo,
 * MIT). A leading accent icon chip, title, message, a trailing timestamp, and
 * an optional inline action; it settles in with a little overshoot.
 * Category: Mouse. Part of the Better Component library.
 */
export function NotificationCard({
  icon,
  title,
  message,
  time,
  accent = "neutral",
  action,
  closeIcon,
  onClose,
  className,
}: NotificationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.9 }}
      className={cn(
        "flex w-80 items-start gap-3 rounded-2xl border border-border bg-card/90 p-3.5 shadow-xl backdrop-blur-xl",
        className
      )}
    >
      {icon && (
        <span
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
            ACCENT[accent]
          )}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{title}</p>
          {time && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {time}
            </span>
          )}
        </div>
        {message && (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {message}
          </p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className={cn(
              "mt-2 cursor-pointer text-xs font-medium hover:underline",
              ACCENT_TEXT[accent]
            )}
          >
            {action.label}
          </button>
        )}
      </div>
      {closeIcon && (
        <button
          aria-label="Dismiss"
          onClick={onClose}
          className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
        >
          {closeIcon}
        </button>
      )}
    </motion.div>
  )
}
