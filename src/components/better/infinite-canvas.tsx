"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { AnimatePresence, motion, useMotionValue } from "motion/react"

import { cn } from "@/lib/utils"

interface Cell {
  col: number
  row: number
}

interface InfiniteCanvasProps {
  /** Tiles laid across the infinite grid; picked deterministically per cell. */
  items: ReactNode[]
  className?: string
  /** Size of each grid cell in px. */
  cellSize?: number
  /** Extra ring of cells kept mounted just outside the viewport. */
  overscan?: number
}

const mod = (n: number, m: number) => ((n % m) + m) % m
// Cheap integer hash so neighbouring cells don't show the same tile.
const pick = (col: number, row: number, len: number) =>
  mod(col * 73856093 + row * 19349663, len)

/**
 * InfiniteCanvas — a pannable, endless grid of tiles. Only the cells on screen
 * (plus a small overscan) are mounted; panning is a GPU transform, so it never
 * re-renders while you drag. Cells that scroll into view pop in with a spring,
 * and cells that leave pop out — so the DOM stays tiny no matter how far you go.
 * Category: UI. Part of the Better Component library.
 */
export function InfiniteCanvas({
  items,
  className,
  cellSize = 88,
  overscan = 1,
}: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const [cells, setCells] = useState<Cell[]>([])
  const size = useRef({ w: 0, h: 0 })
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(
    null
  )
  const rafPending = useRef(false)

  // Recompute the mounted cell set from the current offset + viewport size,
  // only committing to React state when the visible range actually changes.
  const recompute = useCallback(() => {
    rafPending.current = false
    const { w, h } = size.current
    if (!w || !h) return
    const ox = x.get()
    const oy = y.get()

    const colMin = Math.floor((-ox) / cellSize) - overscan
    const colMax = Math.floor((w - ox) / cellSize) + overscan
    const rowMin = Math.floor((-oy) / cellSize) - overscan
    const rowMax = Math.floor((h - oy) / cellSize) + overscan

    setCells((prev) => {
      const next: Cell[] = []
      for (let col = colMin; col <= colMax; col++) {
        for (let row = rowMin; row <= rowMax; row++) next.push({ col, row })
      }
      if (
        prev.length === next.length &&
        prev[0]?.col === next[0]?.col &&
        prev[0]?.row === next[0]?.row &&
        prev[prev.length - 1]?.col === next[next.length - 1]?.col &&
        prev[prev.length - 1]?.row === next[next.length - 1]?.row
      ) {
        return prev
      }
      return next
    })
  }, [cellSize, overscan, x, y])

  const scheduleRecompute = useCallback(() => {
    if (rafPending.current) return
    rafPending.current = true
    requestAnimationFrame(recompute)
  }, [recompute])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      size.current = {
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      }
      recompute()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [recompute])

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { px: e.clientX, py: e.clientY, ox: x.get(), oy: y.get() }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d) return
    x.set(d.ox + (e.clientX - d.px))
    y.set(d.oy + (e.clientY - d.py))
    scheduleRecompute()
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (drag.current) e.currentTarget.releasePointerCapture(e.pointerId)
    drag.current = null
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={cn(
        "relative touch-none cursor-grab overflow-hidden rounded-2xl border border-border bg-muted/20 [background-image:radial-gradient(circle,var(--color-border)_1px,transparent_1px)] [background-size:var(--cell)_var(--cell)] active:cursor-grabbing",
        className
      )}
      style={{ "--cell": `${cellSize}px` } as React.CSSProperties}
    >
      <motion.div style={{ x, y }} className="absolute left-0 top-0">
        <AnimatePresence>
          {cells.map(({ col, row }) => (
            <motion.div
              key={`${col}:${row}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute flex items-center justify-center"
              style={{
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize,
                height: cellSize,
              }}
            >
              <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-foreground shadow-sm">
                {items[pick(col, row, items.length)]}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
