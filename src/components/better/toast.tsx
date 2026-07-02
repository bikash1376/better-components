"use client"

import { useEffect, useState, type ReactNode } from "react"
import { AnimatePresence, motion, type PanInfo } from "motion/react"

import { cn } from "@/lib/utils"

/* ----------------------------------------------------------------- */
/* Store — a tiny observable so toast() works from anywhere           */
/* ----------------------------------------------------------------- */

type ToastType = "default" | "success" | "error" | "warning" | "info"

interface ToastOptions {
  description?: string
  duration?: number
  action?: { label: string; onClick: () => void }
  icon?: ReactNode
}

interface ToastItem extends ToastOptions {
  id: number
  type: ToastType
  title: ReactNode
}

type Listener = (items: ToastItem[]) => void

let items: ToastItem[] = []
let seq = 0
const listeners = new Set<Listener>()

function emit() {
  const snapshot = [...items]
  listeners.forEach((l) => l(snapshot))
}

function add(type: ToastType, title: ReactNode, opts: ToastOptions = {}) {
  const id = ++seq
  items = [...items, { id, type, title, ...opts }]
  emit()
  return id
}

function dismiss(id: number) {
  items = items.filter((t) => t.id !== id)
  emit()
}

/**
 * toast — fire a notification from anywhere. Requires a <Toaster /> mounted once
 * near the root. `toast("Saved")` or `toast.success("Saved", { description })`.
 */
export const toast = Object.assign(
  (title: ReactNode, opts?: ToastOptions) => add("default", title, opts),
  {
    success: (title: ReactNode, opts?: ToastOptions) => add("success", title, opts),
    error: (title: ReactNode, opts?: ToastOptions) => add("error", title, opts),
    warning: (title: ReactNode, opts?: ToastOptions) => add("warning", title, opts),
    info: (title: ReactNode, opts?: ToastOptions) => add("info", title, opts),
    dismiss,
  }
)

/* ----------------------------------------------------------------- */
/* Icons + accents                                                    */
/* ----------------------------------------------------------------- */

const ACCENT: Record<ToastType, string> = {
  default: "bg-muted text-foreground",
  success: "bg-emerald-500/15 text-emerald-500",
  error: "bg-rose-500/15 text-rose-500",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  info: "bg-blue-500/15 text-blue-500",
}

function TypeIcon({ type }: { type: ToastType }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }
  if (type === "success")
    return (
      <svg {...common}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    )
  if (type === "error")
    return (
      <svg {...common}>
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    )
  if (type === "warning")
    return (
      <svg {...common}>
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    )
  if (type === "info")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    )
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

/* ----------------------------------------------------------------- */
/* Toaster                                                            */
/* ----------------------------------------------------------------- */

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right"

const POSITION: Record<Position, string> = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
}

interface ToasterProps {
  position?: Position
  /** Default auto-dismiss in ms. Pass Infinity to keep until dismissed. */
  duration?: number
  className?: string
}

/**
 * Toaster — mount once. Renders the toast stack with spring physics, stacking,
 * swipe-to-dismiss, and hover-to-hold. Inspired by sonner (MIT); reimplemented.
 * Category: Mouse. Part of the Better Component library.
 */
export function Toaster({
  position = "bottom-right",
  duration = 4000,
  className,
}: ToasterProps) {
  const [list, setList] = useState<ToastItem[]>([])
  const isBottom = position.startsWith("bottom")

  useEffect(() => {
    const l: Listener = (next) => setList(next)
    listeners.add(l)
    l([...items])
    return () => {
      listeners.delete(l)
    }
  }, [])

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-[100] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2.5",
        POSITION[position],
        isBottom && "flex-col-reverse",
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {list.map((item) => (
          <Toast
            key={item.id}
            item={item}
            isBottom={isBottom}
            duration={duration}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function Toast({
  item,
  isBottom,
  duration,
}: {
  item: ToastItem
  isBottom: boolean
  duration: number
}) {
  const [hovered, setHovered] = useState(false)
  const ttl = item.duration ?? duration

  useEffect(() => {
    if (ttl === Infinity || hovered) return
    const t = setTimeout(() => dismiss(item.id), ttl)
    return () => clearTimeout(t)
  }, [ttl, hovered, item.id])

  function onDragEnd(_e: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 500) {
      dismiss(item.id)
    }
  }

  return (
    <motion.div
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: isBottom ? 28 : -28, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="pointer-events-auto cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/95 p-3.5 shadow-xl backdrop-blur-xl">
        <span
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
            ACCENT[item.type]
          )}
        >
          {item.icon ?? <TypeIcon type={item.type} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{item.title}</p>
          {item.description && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          )}
          {item.action && (
            <button
              onClick={() => {
                item.action?.onClick()
                dismiss(item.id)
              }}
              className="mt-2 cursor-pointer text-xs font-medium text-foreground hover:underline"
            >
              {item.action.label}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
