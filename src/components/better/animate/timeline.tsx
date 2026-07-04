"use client"

import { memo, useCallback, useEffect, useMemo, useRef } from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  Film,
  Plus,
  Timer,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { drawFrame } from "./export"
import {
  type Frame,
  type FpsSegment,
  type Track,
  CH,
  CW,
  bgAt,
  fpsAt,
  tracksLength,
} from "./types"

export type TimelineTab = "frames" | "time"

const THUMB_W = 80
const THUMB_H = 45
// Past this many frames on a track, thumbnails shrink so the strip stays readable.
const CROWDED_AT = 13
const CROWDED_SCALE = 0.6

/** A live canvas thumbnail of one frame. Redraws only when the frame changes. */
const FrameThumb = memo(function FrameThumb({
  frame,
  bg,
  scale = 1,
}: {
  frame: Frame
  bg: string
  /** Display scale (canvas resolution stays full for crisp thumbnails). */
  scale?: number
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cvs = ref.current
    if (!cvs) return
    const ctx = cvs.getContext("2d")
    if (!ctx) return
    ctx.save()
    ctx.scale(THUMB_W / CW, THUMB_H / CH)
    try {
      drawFrame(ctx, frame, CW, CH, bg)
    } catch {
      /* thumbnails must never crash the editor */
    }
    ctx.restore()
  }, [frame, bg])
  return (
    <canvas
      ref={ref}
      width={THUMB_W}
      height={THUMB_H}
      style={{ width: THUMB_W * scale, height: THUMB_H * scale }}
      className="pointer-events-none rounded-[5px]"
    />
  )
})

function formatTime(seconds: number) {
  return `${seconds.toFixed(2)}s`
}

export function Timeline({
  tracks,
  activeTrack,
  current,
  fps,
  segments,
  bgs,
  tab,
  onTab,
  onSelect,
  onSelectTrack,
  onAddFrame,
  onDeleteFrame,
  onAddTrack,
  onDeleteTrack,
  onToggleTrack,
  onMoveTrack,
  onFrameContextMenu,
}: {
  tracks: Track[]
  activeTrack: number
  current: number
  fps: number
  /** Custom per-segment frame rates (empty = constant `fps`). */
  segments: FpsSegment[]
  bgs: string[]
  tab: TimelineTab
  onTab: (t: TimelineTab) => void
  onSelect: (i: number) => void
  onSelectTrack: (ti: number) => void
  /** Add a frame after the current one on track ti. */
  onAddFrame: (ti: number) => void
  onDeleteFrame: (i: number) => void
  onAddTrack: () => void
  onDeleteTrack: (ti: number) => void
  onToggleTrack: (ti: number) => void
  onMoveTrack: (ti: number, dir: -1 | 1) => void
  onFrameContextMenu: (ti: number, i: number, e: React.MouseEvent) => void
}) {
  const stripRef = useRef<HTMLDivElement>(null)
  const rulerRef = useRef<HTMLDivElement>(null)
  const scrubbing = useRef(false)

  useEffect(() => {
    stripRef.current
      ?.querySelector<HTMLElement>(
        `[data-track="${activeTrack}"] [data-frame="${current}"]`
      )
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }, [current, activeTrack])

  const total = tracksLength(tracks)
  // Cumulative seconds at each frame boundary (honours custom fps segments).
  // times[i] = seconds elapsed before frame i; times[total] = full duration.
  const times = useMemo(() => {
    const arr = [0]
    for (let i = 0; i < total; i++)
      arr.push(arr[i] + 1 / fpsAt(fps, segments, i))
    return arr
  }, [fps, segments, total])
  const duration = times[total]
  // x-fraction (0..1) along the frame axis for a given time in seconds.
  const fracForSeconds = (sec: number) => {
    let f = 0
    while (f < total && times[f] < sec) f++
    return total ? f / total : 0
  }

  const scrubTo = useCallback(
    (clientX: number) => {
      const el = rulerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const t = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      onSelect(Math.min(total - 1, Math.floor(t * total)))
    },
    [onSelect, total]
  )

  useEffect(() => {
    const move = (e: PointerEvent) => scrubbing.current && scrubTo(e.clientX)
    const up = () => (scrubbing.current = false)
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
  }, [scrubTo])

  // Second ticks (with sub-ticks when the animation is short).
  const seconds = Math.ceil(duration)
  const ticks: { t: number; major: boolean }[] = []
  const minor = duration <= 8 ? 0.25 : duration <= 20 ? 0.5 : 1
  for (let t = 0; t <= seconds + 1e-6; t += minor) {
    ticks.push({ t, major: Math.abs(t - Math.round(t)) < 1e-6 })
  }

  const trackHeader = (t: Track, ti: number) => (
    <div
      onClick={() => onSelectTrack(ti)}
      className={cn(
        "flex w-32 shrink-0 cursor-pointer items-center gap-1 rounded-md border px-1.5 py-1",
        ti === activeTrack
          ? "border-blue-500/60 bg-blue-500/10"
          : "border-border hover:border-foreground/30"
      )}
      title={`${t.name} — click to make active`}
    >
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[11px] font-medium",
          !t.visible && "text-muted-foreground line-through"
        )}
      >
        {t.name}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleTrack(ti)
        }}
        className="cursor-pointer text-muted-foreground hover:text-foreground"
        title={t.visible ? "Hide track" : "Show track"}
      >
        {t.visible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
      </button>
      <span className="flex flex-col">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMoveTrack(ti, -1)
          }}
          disabled={ti === 0}
          className="cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-25"
          title="Move up (renders above)"
        >
          <ChevronUp className="size-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMoveTrack(ti, 1)
          }}
          disabled={ti === tracks.length - 1}
          className="cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-25"
          title="Move down (renders below)"
        >
          <ChevronDown className="size-3" />
        </button>
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDeleteTrack(ti)
        }}
        className="cursor-pointer text-muted-foreground hover:text-destructive"
        title="Delete track"
      >
        <Trash2 className="size-3" />
      </button>
    </div>
  )

  return (
    <footer data-tour="timeline" className="border-t border-border">
      {/* Tab bar + transport + track controls */}
      <div className="flex items-center justify-between px-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
            <button
              onClick={() => onTab("frames")}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium",
                tab === "frames"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Film className="size-3" /> Frames
            </button>
            <button
              onClick={() => onTab("time")}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium",
                tab === "time"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Timer className="size-3" /> Time
            </button>
          </div>
          <button
            onClick={() => onSelect(Math.max(0, current - 1))}
            className="inline-flex size-6 cursor-pointer items-center justify-center rounded-md border border-border hover:bg-muted"
            title="Previous frame ["
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            onClick={() => onSelect(Math.min(total - 1, current + 1))}
            className="inline-flex size-6 cursor-pointer items-center justify-center rounded-md border border-border hover:bg-muted"
            title="Next frame ]"
          >
            <ChevronRight className="size-3.5" />
          </button>
          <button
            onClick={onAddTrack}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Add a track — tracks layer on top of each other"
          >
            <Plus className="size-3" /> Track
          </button>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {formatTime(times[Math.min(current, total)])} / {formatTime(duration)} ·
          frame <span className="text-foreground">{current + 1}</span>/{total}
        </span>
      </div>

      {tab === "frames" ? (
        <div
          ref={stripRef}
          className="max-h-44 space-y-1.5 overflow-y-auto px-3 py-2.5"
        >
          {tracks.map((t, ti) => {
            // Shrink thumbnails once a track gets crowded (13+ frames).
            const scale = t.frames.length >= CROWDED_AT ? CROWDED_SCALE : 1
            return (
            <div key={t.id} data-track={ti} className="flex items-center gap-2">
              {trackHeader(t, ti)}
              <div
                onWheel={(e) => {
                  // Vertical wheel scrolls the frame strip horizontally.
                  const el = e.currentTarget
                  if (el.scrollWidth <= el.clientWidth) return
                  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
                  el.scrollLeft += e.deltaY
                }}
                className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-0.5"
              >
                {t.frames.map((f, i) => (
                  <button
                    key={f.id}
                    data-frame={i}
                    onClick={() => {
                      onSelectTrack(ti)
                      onSelect(i)
                    }}
                    onContextMenu={(e) => onFrameContextMenu(ti, i, e)}
                    className={cn(
                      "relative shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-colors",
                      ti === activeTrack && i === current
                        ? "border-blue-500"
                        : i === Math.min(current, t.frames.length - 1)
                          ? "border-foreground/45"
                          : "border-border hover:border-foreground/40",
                      !t.visible && "opacity-40"
                    )}
                    title={`${t.name} · frame ${i + 1} — right-click for options`}
                  >
                    <FrameThumb frame={f} bg={bgAt(bgs, i)} scale={scale} />
                    <span
                      className={cn(
                        "absolute bottom-0 left-0 rounded-tr bg-background/85 px-1 font-mono text-[9px] tabular-nums",
                        ti === activeTrack && i === current
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {i + 1}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => onAddFrame(ti)}
                  style={{ width: (THUMB_W / 2) * scale + 4, height: THUMB_H * scale + 4 }}
                  className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  title="Add frame (duplicates current)"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              {ti === activeTrack && (
                <button
                  onClick={() => onDeleteFrame(current)}
                  className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="Delete current frame"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
            )
          })}
        </div>
      ) : (
        <div className="px-3 pb-3 pt-2">
          {/* shared ruler */}
          <div
            ref={rulerRef}
            onPointerDown={(e) => {
              scrubbing.current = true
              scrubTo(e.clientX)
            }}
            className="relative h-7 cursor-col-resize select-none overflow-hidden rounded-t-lg border border-b-0 border-border bg-muted/30"
          >
            {ticks.map(({ t, major }) => {
              const left = `${Math.min(100, fracForSeconds(t) * 100)}%`
              return (
                <div key={t} className="absolute top-0 h-full" style={{ left }}>
                  <div
                    className={cn(
                      "w-px",
                      major ? "h-3 bg-foreground/40" : "h-1.5 bg-foreground/20"
                    )}
                  />
                  {major && t < duration && (
                    <span className="absolute left-1 top-2.5 font-mono text-[9px] text-muted-foreground">
                      {t}s
                    </span>
                  )}
                </div>
              )
            })}
            <Playhead current={current} total={total} withHandle />
          </div>
          {/* one strip per track */}
          <div className="relative max-h-32 overflow-y-auto rounded-b-lg border border-border">
            {tracks.map((t, ti) => (
              <div
                key={t.id}
                className={cn(
                  "flex h-7 items-stretch border-b border-border/60 last:border-b-0",
                  ti === activeTrack && "bg-blue-500/5"
                )}
              >
                <button
                  onClick={() => onSelectTrack(ti)}
                  className={cn(
                    "w-32 shrink-0 cursor-pointer truncate border-r border-border px-2 text-left text-[10px] font-medium",
                    ti === activeTrack ? "text-foreground" : "text-muted-foreground",
                    !t.visible && "line-through opacity-50"
                  )}
                >
                  {t.name}
                </button>
                <div className="relative flex min-w-0 flex-1">
                  {Array.from({ length: total }, (_, i) => {
                    const fr = t.frames[Math.min(i, t.frames.length - 1)]
                    const real = i < t.frames.length
                    return (
                      <div
                        key={i}
                        onPointerDown={() => {
                          onSelectTrack(ti)
                          onSelect(i)
                        }}
                        className={cn(
                          "h-full flex-1 cursor-pointer border-r border-background/50",
                          real
                            ? fr.shapes.length
                              ? "bg-blue-500/25 hover:bg-blue-500/40"
                              : "bg-foreground/5 hover:bg-foreground/10"
                            : "bg-foreground/[0.02]",
                          ti === activeTrack && i === current && "bg-blue-500/60"
                        )}
                        title={`${t.name} · frame ${i + 1}${real ? ` · ${fr.shapes.length} shape${fr.shapes.length === 1 ? "" : "s"}` : " (holds last frame)"}`}
                      />
                    )
                  })}
                  <Playhead current={current} total={total} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Drag the ruler to scrub · tracks layer bottom-to-top ·{" "}
            {segments.length ? "custom fps" : `${fps} fps`} · {total} frames ={" "}
            {formatTime(duration)}
          </p>
        </div>
      )}
    </footer>
  )
}

function Playhead({
  current,
  total,
  withHandle,
}: {
  current: number
  total: number
  withHandle?: boolean
}) {
  return (
    <div
      className="pointer-events-none absolute top-0 z-10 h-full"
      style={{ left: `${((current + 0.5) / total) * 100}%` }}
    >
      <div className="absolute -left-px h-full w-0.5 bg-blue-500" />
      {withHandle && (
        <div className="absolute -left-[5px] top-0 size-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-blue-500" />
      )}
    </div>
  )
}
