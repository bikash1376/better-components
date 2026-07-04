"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Circle,
  Clock,
  Download,
  Heart,
  Hexagon,
  ImagePlus,
  LayoutTemplate,
  Layers,
  Maximize2,
  MessageSquare,
  Minus,
  MoveRight,
  Pause,
  Pencil,
  Play,
  Plus,
  Redo2,
  Send,
  Shapes,
  Sparkles,
  Square,
  Star,
  Triangle as TriangleIcon,
  Type,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { type AiScene, bakeScene } from "./ai"
import { exportWebm } from "./export"
import { imageCache } from "./icons"
import { PRESETS } from "./presets"
import { TEXT_ANIMS } from "./text-anims"
import { CanvasProperties, Properties } from "./properties"
import { ShapeView, SelectionBox } from "./render"
import { Timeline, type TimelineTab } from "./timeline"
import {
  type ChatMessage,
  type Corner,
  type Frame,
  type Shape,
  type ShapeType,
  type Track,
  CH,
  CW,
  FRAME_RATES,
  MAX_FRAMES,
  ANIM_KEYS,
  bgAt,
  cloneShapes,
  createShape,
  emptyFrame,
  makeShape,
  makeTrack,
  padBgs,
  pointsToPath,
  trackFrameAt,
  tracksLength,
  tweenBgs,
  tweenFrames,
  uid,
} from "./types"

const SHAPE_TEMPLATES: { type: ShapeType; label: string; icon: React.ReactNode }[] = [
  { type: "square", label: "Square", icon: <Square className="size-4" /> },
  { type: "circle", label: "Circle", icon: <Circle className="size-4" /> },
  {
    type: "rectangle",
    label: "Rectangle",
    icon: <div className="h-3 w-4 rounded-[2px] border-2 border-current" />,
  },
  { type: "triangle", label: "Triangle", icon: <TriangleIcon className="size-4" /> },
  {
    type: "oval",
    label: "Oval",
    icon: <div className="h-3 w-4 rounded-full border-2 border-current" />,
  },
  { type: "star", label: "Star", icon: <Star className="size-4" /> },
  { type: "heart", label: "Heart", icon: <Heart className="size-4" /> },
  { type: "hexagon", label: "Hexagon", icon: <Hexagon className="size-4" /> },
  { type: "line", label: "Line", icon: <Minus className="size-4" /> },
  { type: "arrow", label: "Arrow", icon: <MoveRight className="size-4" /> },
  {
    type: "button",
    label: "Button",
    icon: (
      <div className="rounded bg-current px-1.5 py-0.5 text-[8px] text-background">
        Btn
      </div>
    ),
  },
  { type: "icon", label: "Icon", icon: <Shapes className="size-4" /> },
  { type: "text", label: "Text", icon: <Type className="size-4" /> },
]

const AI_SUGGESTIONS = [
  "A red ball bouncing across the screen",
  "Confetti burst over a dark background",
  "Cinematic title intro that says “Summer”",
  "A rocket launching with smoke trails",
]

const MAX_HISTORY = 60
const MIN_ZOOM = 0.2
const MAX_ZOOM = 6

// AI chat is disabled for now: the /api/animate route is a public, unauthed
// proxy to Mistral with no rate limiting, so exposing it would let anyone burn
// the API key. Flip this to true once a rate limiter + origin check are in
// place on the route (see README → "AI chat"). This hides the toolbar button
// and the chat overlay; the sendMessage plumbing is left intact.
const AI_ENABLED = false

// ─── Component ───────────────────────────────────────────────────────────────
export function Animate({
  className,
  aiEndpoint = "/api/animate",
}: {
  className?: string
  aiEndpoint?: string
}) {
  // Tracks are layered frame sequences; index 0 is the TOP layer.
  const [tracks, setTracks] = useState<Track[]>([makeTrack("Track 1")])
  const [activeTrack, setActiveTrack] = useState(0)
  const [current, setCurrent] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [fps, setFps] = useState(24)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [menu, setMenu] = useState<{ x: number; y: number; frame: number } | null>(null)
  const [shapesOpen, setShapesOpen] = useState(false)
  const [gotoOpen, setGotoOpen] = useState(false)
  const [gotoMode, setGotoMode] = useState<"second" | "frame">("second")
  const [gotoVal, setGotoVal] = useState("")
  // "select" = drag/resize shapes; "draw" = freehand pencil on the canvas.
  const [tool, setTool] = useState<"select" | "draw">("select")
  // Live freehand stroke while drawing (flattened artboard points [x0,y0,…]).
  const [drawPts, setDrawPts] = useState<number[] | null>(null)
  const [baseScale, setBaseScale] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [onion, setOnion] = useState(false)
  const [grid, setGrid] = useState(true)
  // Per-frame (auto-keyframed) canvas background, indexed by global frame.
  const [bgs, setBgs] = useState<string[]>(["#ffffff"])
  const [timelineTab, setTimelineTab] = useState<TimelineTab>("frames")
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const frameClipboard = useRef<Shape[] | null>(null)
  const shapeClipboard = useRef<Shape | null>(null)
  const lastScene = useRef<AiScene | null>(null)
  const dragState = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null)
  const resizeState = useRef<{
    id: string
    corner: Corner
    ox: number
    oy: number
    ow: number
    oh: number
    px: number
    py: number
    moved: boolean
  } | null>(null)
  const pendingMove = useRef<{ x: number; y: number } | null>(null)
  const moveRaf = useRef(0)

  // Latest state in refs so event handlers stay referentially stable.
  const tracksRef = useRef(tracks)
  const activeTrackRef = useRef(activeTrack)
  const framesRef = useRef<Frame[]>(tracks[0].frames)
  const currentRef = useRef(current)
  const zoomRef = useRef(zoom)
  const bgsRef = useRef(bgs)
  const toolRef = useRef(tool)
  const drawRef = useRef<number[] | null>(null)
  useEffect(() => {
    tracksRef.current = tracks
    framesRef.current =
      tracks[Math.min(activeTrack, tracks.length - 1)].frames
  }, [tracks, activeTrack])
  useEffect(() => {
    activeTrackRef.current = activeTrack
  }, [activeTrack])
  useEffect(() => {
    currentRef.current = current
  }, [current])
  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])
  useEffect(() => {
    bgsRef.current = bgs
  }, [bgs])
  useEffect(() => {
    toolRef.current = tool
  }, [tool])

  /** Update the active track's frames (accepts a value or an updater). */
  const setFrames = useCallback(
    (updater: Frame[] | ((f: Frame[]) => Frame[])) => {
      const at = activeTrackRef.current
      setTracks((ts) =>
        ts.map((t, i) =>
          i === at
            ? {
                ...t,
                frames:
                  typeof updater === "function" ? updater(t.frames) : updater,
              }
            : t
        )
      )
    },
    []
  )

  const safeActive = Math.min(activeTrack, tracks.length - 1)
  const activeFrames = tracks[safeActive].frames
  const maxLen = tracksLength(tracks)
  const curBg = bgAt(bgs, current)
  // Editing targets the active track's frame at the (clamped) global index.
  const editIndex = Math.min(current, activeFrames.length - 1)
  const frame = activeFrames[editIndex]
  const selected = frame?.shapes.find((s) => s.id === selectedId) ?? null

  // ── History (undo/redo) — snapshots the track stack + per-frame background ──
  type Snap = { tracks: Track[]; bgs: string[] }
  const past = useRef<Snap[]>([])
  const future = useRef<Snap[]>([])
  const lastSnap = useRef<{ tag: string; time: number }>({ tag: "", time: 0 })
  const nowSnap = useCallback(
    (): Snap => ({ tracks: tracksRef.current, bgs: bgsRef.current }),
    []
  )
  const restore = useCallback((s: Snap) => {
    setTracks(s.tracks)
    setBgs(s.bgs)
    setActiveTrack((a) => Math.min(a, s.tracks.length - 1))
    setCurrent((c) => Math.min(c, tracksLength(s.tracks) - 1))
    setSelectedId(null)
    lastSnap.current = { tag: "", time: 0 }
  }, [])

  const snapshot = useCallback((tag = "") => {
    const now = Date.now()
    // Collapse bursts of the same operation (slider drags, nudges) into one entry.
    if (tag && lastSnap.current.tag === tag && now - lastSnap.current.time < 600) {
      lastSnap.current.time = now
      return
    }
    lastSnap.current = { tag, time: now }
    past.current.push(nowSnap())
    if (past.current.length > MAX_HISTORY) past.current.shift()
    future.current = []
    setCanUndo(true)
    setCanRedo(false)
  }, [nowSnap])

  const undo = useCallback(() => {
    const prev = past.current.pop()
    if (!prev) return
    future.current.push(nowSnap())
    restore(prev)
    setCanUndo(past.current.length > 0)
    setCanRedo(true)
  }, [nowSnap, restore])

  const redo = useCallback(() => {
    const next = future.current.pop()
    if (!next) return
    past.current.push(nowSnap())
    restore(next)
    setCanUndo(true)
    setCanRedo(future.current.length > 0)
  }, [nowSnap, restore])

  // ── Fit the fixed artboard into the available stage space ────────────────
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const fit = () => {
      const pad = 40
      setBaseScale(
        Math.max(
          0.1,
          Math.min((el.clientWidth - pad) / CW, (el.clientHeight - pad) / CH)
        )
      )
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ── Zoom & pan (Ctrl+scroll zoom to cursor, scroll pans) ──────────────────
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        const rect = el.getBoundingClientRect()
        const px = e.clientX - rect.left - rect.width / 2
        const py = e.clientY - rect.top - rect.height / 2
        setZoom((z) => {
          const nz = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z * Math.exp(-e.deltaY * 0.002)))
          setPan((p) => {
            const k = nz / z
            return { x: px - (px - p.x) * k, y: py - (py - p.y) * k }
          })
          return nz
        })
      } else {
        setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }))
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const zoomBy = useCallback((factor: number) => {
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z * factor)))
  }, [])

  // Convert a pointer event to artboard-logical coordinates.
  const toLocal = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const sc = rect.width / CW
    return { x: (clientX - rect.left) / sc, y: (clientY - rect.top) / sc }
  }, [])

  const patchShape = useCallback(
    (id: string, patch: Partial<Shape>) => {
      setFrames((f) => {
        const idx = Math.min(currentRef.current, f.length - 1)
        return f.map((fr, i) =>
          i === idx
            ? {
                ...fr,
                // Editing a shape on this frame makes it a keyframe (tween anchor).
                shapes: fr.shapes.map((s) =>
                  s.id === id ? { ...s, ...patch, key: true } : s
                ),
              }
            : fr
        )
      })
    },
    [setFrames]
  )

  /** Auto-keyframe: fill the in-between frames for a shape after any animatable edit. */
  const commitTween = useCallback(
    (id: string) => {
      setFrames((f) => tweenFrames(f, id, currentRef.current))
    },
    [setFrames]
  )

  /** Set the background on the current frame and tween it back to the last bg keyframe. */
  const setBgAt = useCallback(
    (color: string) => {
      snapshot("bg")
      setBgs((prev) => {
        const next = padBgs(prev, tracksLength(tracksRef.current)).slice()
        const idx = Math.min(currentRef.current, next.length - 1)
        next[idx] = color
        return tweenBgs(next, idx)
      })
    },
    [snapshot]
  )

  const updateShape = useCallback(
    (patch: Partial<Shape>) => {
      if (!selectedId) return
      snapshot(`prop:${selectedId}:${Object.keys(patch).join(",")}`)
      patchShape(selectedId, patch)
      if (ANIM_KEYS.some((k) => k in patch)) commitTween(selectedId)
    },
    [patchShape, selectedId, snapshot, commitTween]
  )

  const deleteShape = useCallback(() => {
    if (!selectedId) return
    snapshot()
    setFrames((f) => {
      const idx = Math.min(currentRef.current, f.length - 1)
      return f.map((fr, i) =>
        i === idx
          ? { ...fr, shapes: fr.shapes.filter((s) => s.id !== selectedId) }
          : fr
      )
    })
    setSelectedId(null)
  }, [selectedId, snapshot, setFrames])

  const reorder = useCallback(
    (dir: "front" | "back") => {
      if (!selectedId) return
      snapshot()
      setFrames((f) => {
        const cur = Math.min(currentRef.current, f.length - 1)
        return f.map((fr, i) => {
          if (i !== cur) return fr
          const idx = fr.shapes.findIndex((s) => s.id === selectedId)
          if (idx < 0) return fr
          const arr = [...fr.shapes]
          const [sh] = arr.splice(idx, 1)
          if (dir === "front") arr.push(sh)
          else arr.unshift(sh)
          return { ...fr, shapes: arr }
        })
      })
    },
    [selectedId, snapshot, setFrames]
  )

  const addShapeToCurrent = useCallback(
    (shape: Shape) => {
      snapshot()
      setFrames((f) => {
        const idx = Math.min(currentRef.current, f.length - 1)
        return f.map((fr, i) =>
          i === idx ? { ...fr, shapes: [...fr.shapes, shape] } : fr
        )
      })
      setSelectedId(shape.id)
    },
    [snapshot, setFrames]
  )

  /** Turn a freehand stroke (flattened artboard points) into a `draw` shape. */
  const commitDraw = useCallback(
    (pts: number[]) => {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (let i = 0; i < pts.length - 1; i += 2) {
        minX = Math.min(minX, pts[i])
        maxX = Math.max(maxX, pts[i])
        minY = Math.min(minY, pts[i + 1])
        maxY = Math.max(maxY, pts[i + 1])
      }
      const rel: number[] = []
      for (let i = 0; i < pts.length - 1; i += 2)
        rel.push(pts[i] - minX, pts[i + 1] - minY)
      addShapeToCurrent(
        makeShape({
          type: "draw",
          x: minX,
          y: minY,
          w: Math.max(1, maxX - minX),
          h: Math.max(1, maxY - minY),
          points: rel,
          transparentFill: true,
          fill: "#111827",
          strokeWidth: 3,
        })
      )
    },
    [addShapeToCurrent]
  )

  /** Jump to a global frame index, materialising the active track up to it. */
  const goTo = useCallback(
    (targetIndex: number) => {
      const idx = Math.max(0, Math.min(MAX_FRAMES - 1, Math.round(targetIndex)))
      const at = activeTrackRef.current
      const t = tracksRef.current[at]
      if (idx > t.frames.length - 1) {
        snapshot()
        setTracks((ts) =>
          ts.map((tr, i) => {
            if (i !== at) return tr
            const next = [...tr.frames]
            while (next.length <= idx)
              next.push({
                id: uid(),
                shapes: cloneShapes(next[next.length - 1].shapes),
              })
            return { ...tr, frames: next }
          })
        )
      }
      setCurrent(idx)
      setSelectedId(null)
      setGotoOpen(false)
    },
    [snapshot]
  )

  /**
   * Apply a prebuilt text animation to the selected shape: animate it from a
   * lead-in state (or reveal its text) across the frames between where it first
   * appears and the current frame. Baked as keyframes so it also exports.
   */
  const applyTextAnim = useCallback(
    (animId: string) => {
      if (!selectedId) return
      const anim = TEXT_ANIMS.find((a) => a.id === animId)
      if (!anim) return
      const f = framesRef.current
      const end = Math.min(currentRef.current, f.length - 1)
      // Start = the frame where the shape first appears.
      let start = -1
      for (let i = 0; i <= end; i++) {
        if (f[i].shapes.some((s) => s.id === selectedId)) {
          start = i
          break
        }
      }
      if (start < 0 || end <= start) return // need a later frame (go to ~2s first)
      const final = f[end].shapes.find((s) => s.id === selectedId)
      if (!final) return

      snapshot()
      setFrames((frames) => {
        let next = frames.map((fr, i) => {
          if (i < start || i > end) return fr
          return {
            ...fr,
            shapes: fr.shapes.map((s) => {
              if (s.id !== selectedId) return s
              if (anim.reveal) {
                const p = (i - start) / (end - start)
                return { ...s, text: anim.reveal(final.text, p), key: i === start || i === end }
              }
              if (i === start) return { ...s, ...anim.from!(final), key: true }
              if (i === end) return { ...s, key: true }
              return { ...s, key: false } // clear holds so the tween spans start→end
            }),
          }
        })
        if (!anim.reveal) next = tweenFrames(next, selectedId, end)
        return next
      })
    },
    [selectedId, snapshot, setFrames]
  )

  /** The active track's frame at the (clamped) global index, read from refs. */
  const activeFrameNow = useCallback(() => {
    const f = framesRef.current
    return f[Math.min(currentRef.current, f.length - 1)]
  }, [])

  // ── Shape clipboard ────────────────────────────────────────────────────────
  const copySelected = useCallback(() => {
    const sh = activeFrameNow()?.shapes.find((s) => s.id === selectedId)
    if (sh) shapeClipboard.current = { ...sh }
  }, [selectedId, activeFrameNow])

  const pasteShape = useCallback(() => {
    const clip = shapeClipboard.current
    if (!clip) return
    addShapeToCurrent({ ...clip, id: uid(), x: clip.x + 12, y: clip.y + 12 })
  }, [addShapeToCurrent])

  const duplicateSelected = useCallback(() => {
    const sh = activeFrameNow()?.shapes.find((s) => s.id === selectedId)
    if (sh) addShapeToCurrent({ ...sh, id: uid(), x: sh.x + 12, y: sh.y + 12 })
  }, [selectedId, addShapeToCurrent, activeFrameNow])

  const nudgeSelected = useCallback(
    (dx: number, dy: number) => {
      if (!selectedId) return
      const sh = activeFrameNow()?.shapes.find((s) => s.id === selectedId)
      if (!sh) return
      snapshot(`nudge:${selectedId}`)
      patchShape(selectedId, { x: sh.x + dx, y: sh.y + dy })
      commitTween(selectedId)
    },
    [selectedId, patchShape, snapshot, activeFrameNow, commitTween]
  )

  // ── Frame ops (target a track; default = active) ──────────────────────────
  const addFrame = useCallback(
    (ti?: number) => {
      snapshot()
      const at = ti ?? activeTrackRef.current
      if (ti !== undefined) setActiveTrack(ti)
      const t = tracksRef.current[at]
      const cur = Math.min(currentRef.current, t.frames.length - 1)
      setTracks((ts) =>
        ts.map((tr, i) => {
          if (i !== at) return tr
          const next = [...tr.frames]
          next.splice(cur + 1, 0, {
            id: uid(),
            shapes: cloneShapes(tr.frames[cur].shapes),
          })
          return { ...tr, frames: next }
        })
      )
      setCurrent(cur + 1)
    },
    [snapshot]
  )

  const deleteFrame = useCallback(
    (index: number) => {
      snapshot()
      const t = tracksRef.current[activeTrackRef.current]
      const idx = Math.min(index, t.frames.length - 1)
      setFrames((f) =>
        f.length === 1 ? [emptyFrame()] : f.filter((_, i) => i !== idx)
      )
      setCurrent((c) => Math.max(0, c > idx ? c - 1 : c))
      setSelectedId(null)
    },
    [snapshot, setFrames]
  )

  const go = useCallback((dir: -1 | 1) => {
    setCurrent((c) =>
      Math.max(0, Math.min(tracksLength(tracksRef.current) - 1, c + dir))
    )
  }, [])

  // ── Track ops ──────────────────────────────────────────────────────────────
  const addTrack = useCallback(() => {
    snapshot()
    const ts = tracksRef.current
    // New tracks go on top (index 0), like a layers panel.
    setTracks([makeTrack(`Track ${ts.length + 1}`), ...ts])
    setActiveTrack(0)
    setSelectedId(null)
  }, [snapshot])

  const deleteTrack = useCallback(
    (ti: number) => {
      snapshot()
      const ts = tracksRef.current
      const next =
        ts.length === 1 ? [makeTrack("Track 1")] : ts.filter((_, i) => i !== ti)
      setTracks(next)
      setActiveTrack((a) => Math.max(0, Math.min(a > ti ? a - 1 : a, next.length - 1)))
      setCurrent((c) => Math.min(c, tracksLength(next) - 1))
      setSelectedId(null)
    },
    [snapshot]
  )

  const toggleTrack = useCallback((ti: number) => {
    setTracks((ts) =>
      ts.map((t, i) => (i === ti ? { ...t, visible: !t.visible } : t))
    )
  }, [])

  const moveTrack = useCallback(
    (ti: number, dir: -1 | 1) => {
      const to = ti + dir
      const ts = tracksRef.current
      if (to < 0 || to >= ts.length) return
      snapshot()
      const next = [...ts]
      ;[next[ti], next[to]] = [next[to], next[ti]]
      setTracks(next)
      setActiveTrack((a) => (a === ti ? to : a === to ? ti : a))
    },
    [snapshot]
  )

  // ── Frame context-menu actions ─────────────────────────────────────────────
  const copyFrame = useCallback((index: number) => {
    frameClipboard.current = cloneShapes(framesRef.current[index].shapes)
  }, [])

  const pasteFrame = useCallback(
    (index: number) => {
      if (!frameClipboard.current) return
      snapshot()
      const clip = frameClipboard.current
      setFrames((f) =>
        f.map((fr, i) => (i === index ? { ...fr, shapes: cloneShapes(clip) } : fr))
      )
    },
    [snapshot, setFrames]
  )

  const pasteToNext = useCallback(
    (index: number, count: number) => {
      if (!frameClipboard.current) return
      snapshot()
      const clip = frameClipboard.current
      setFrames((f) => {
        const next = [...f]
        for (let k = 1; k <= count; k++) {
          const at = index + k
          const shapes = cloneShapes(clip)
          if (at < next.length) next[at] = { ...next[at], shapes }
          else next.push({ id: uid(), shapes })
        }
        return next
      })
    },
    [snapshot, setFrames]
  )

  const duplicateFrame = useCallback(
    (index: number) => {
      snapshot()
      setFrames((f) => {
        const next = [...f]
        next.splice(index + 1, 0, { id: uid(), shapes: cloneShapes(f[index].shapes) })
        return next
      })
    },
    [snapshot, setFrames]
  )

  // Close context menu on any outside click / scroll.
  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    window.addEventListener("click", close)
    window.addEventListener("scroll", close, true)
    return () => {
      window.removeEventListener("click", close)
      window.removeEventListener("scroll", close, true)
    }
  }, [menu])

  // ── Drop a template onto the canvas ────────────────────────────────────────
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const type = e.dataTransfer.getData("shape") as ShapeType
    if (!type) return
    const p = toLocal(e.clientX, e.clientY)
    addShapeToCurrent(createShape(type, p.x, p.y))
  }

  function applyPreset(gen: () => Frame[]) {
    snapshot()
    const clip = gen()
    const f = framesRef.current
    const cur = Math.min(currentRef.current, f.length - 1)
    setFrames([...f.slice(0, cur + 1), ...clip, ...f.slice(cur + 1)])
    setCurrent(cur + 1)
    setSelectedId(null)
    setShapesOpen(false)
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      const img = new Image()
      img.onload = () => {
        imageCache.set(src, img)
        const fit = Math.min(1, 240 / img.width, 200 / img.height)
        const w = img.width * fit
        const h = img.height * fit
        addShapeToCurrent(
          makeShape({
            type: "image",
            src,
            x: CW / 2 - w / 2,
            y: CH / 2 - h / 2,
            w,
            h,
            radius: 8,
          })
        )
      }
      img.src = src
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  // ── Drag-move + corner-resize (rAF-batched for smoothness) ────────────────
  const onShapePointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      if (isPlaying || toolRef.current === "draw") return
      setSelectedId(id)
      const sh = framesRef.current[currentRef.current]?.shapes.find(
        (s) => s.id === id
      )
      if (!sh) return
      const p = toLocal(e.clientX, e.clientY)
      dragState.current = { id, dx: p.x - sh.x, dy: p.y - sh.y, moved: false }
    },
    [isPlaying, toLocal]
  )

  useEffect(() => {
    function apply() {
      moveRaf.current = 0
      const pos = pendingMove.current
      if (!pos || !canvasRef.current) return
      const { x: cx, y: cy } = toLocal(pos.x, pos.y)
      if (dragState.current) {
        const ds = dragState.current
        if (!ds.moved) {
          ds.moved = true
          snapshot(`drag:${ds.id}`)
        }
        patchShape(ds.id, { x: cx - ds.dx, y: cy - ds.dy })
      } else if (resizeState.current) {
        const rs = resizeState.current
        if (!rs.moved) {
          rs.moved = true
          snapshot(`resize:${rs.id}`)
        }
        let { ox: x, oy: y, ow: w, oh: h } = rs
        const dx = cx - rs.px
        const dy = cy - rs.py
        if (rs.corner.includes("e")) w = Math.max(4, rs.ow + dx)
        if (rs.corner.includes("s")) h = Math.max(4, rs.oh + dy)
        if (rs.corner.includes("w")) {
          w = Math.max(4, rs.ow - dx)
          x = rs.ox + (rs.ow - w)
        }
        if (rs.corner.includes("n")) {
          h = Math.max(4, rs.oh - dy)
          y = rs.oy + (rs.oh - h)
        }
        patchShape(rs.id, { x, y, w, h })
      }
    }
    function move(e: PointerEvent) {
      if (!dragState.current && !resizeState.current) return
      pendingMove.current = { x: e.clientX, y: e.clientY }
      if (!moveRaf.current) moveRaf.current = requestAnimationFrame(apply)
    }
    function up() {
      const d = dragState.current
      const r = resizeState.current
      // Only a real move/resize (not a bare click) triggers a tween fill.
      const movedId = d?.moved ? d.id : r?.moved ? r.id : null
      dragState.current = null
      resizeState.current = null
      pendingMove.current = null
      if (movedId) commitTween(movedId)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      if (moveRaf.current) cancelAnimationFrame(moveRaf.current)
    }
  }, [patchShape, toLocal, snapshot, commitTween])

  // ── Freehand pencil (draw tool): capture a stroke, bake it into a draw shape ─
  useEffect(() => {
    let raf = 0
    const flush = () => {
      raf = 0
      if (drawRef.current) setDrawPts(drawRef.current.slice())
    }
    function move(e: PointerEvent) {
      if (!drawRef.current) return
      const { x, y } = toLocal(e.clientX, e.clientY)
      drawRef.current.push(x, y)
      if (!raf) raf = requestAnimationFrame(flush)
    }
    function up() {
      const pts = drawRef.current
      drawRef.current = null
      if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
      setDrawPts(null)
      if (pts && pts.length >= 4) commitDraw(pts)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [toLocal, commitDraw])

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName || "").toLowerCase()
      if (tag === "input" || tag === "textarea" || tag === "select") return
      const mod = e.ctrlKey || e.metaKey

      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault()
        redo()
        return
      }
      if (mod && e.key.toLowerCase() === "c" && selectedId) {
        e.preventDefault()
        copySelected()
        return
      }
      if (mod && e.key.toLowerCase() === "v") {
        e.preventDefault()
        pasteShape()
        return
      }
      if (mod && e.key.toLowerCase() === "d" && selectedId) {
        e.preventDefault()
        duplicateSelected()
        return
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault()
        deleteShape()
        return
      }
      if (e.key === " ") {
        e.preventDefault()
        setIsPlaying((p) => !p)
        return
      }
      if (e.key === "[") return go(-1)
      if (e.key === "]") return go(1)
      if (e.key.toLowerCase() === "o" && !mod) {
        setOnion((o) => !o)
        return
      }
      if (e.key === "Escape") {
        setSelectedId(null)
        setMenu(null)
        setShapesOpen(false)
        setGotoOpen(false)
        setTool("select")
        return
      }
      if (e.key.toLowerCase() === "b" && !mod) {
        setTool((t) => (t === "draw" ? "select" : "draw"))
        return
      }
      if (e.key.startsWith("Arrow") && selectedId) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const d = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
        }[e.key]
        if (d) nudgeSelected(d[0], d[1])
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [
    selectedId,
    deleteShape,
    undo,
    redo,
    copySelected,
    pasteShape,
    duplicateSelected,
    nudgeSelected,
    go,
  ])

  // ── Playback: rAF with a time accumulator (no setInterval drift) ──────────
  useEffect(() => {
    if (!isPlaying || maxLen < 2) return
    let raf = 0
    let last = performance.now()
    let acc = 0
    const step = (now: number) => {
      acc += now - last
      last = now
      const frameMs = 1000 / fps
      if (acc >= frameMs) {
        const adv = Math.floor(acc / frameMs)
        acc -= adv * frameMs
        setCurrent((c) => (c + adv) % tracksLength(tracksRef.current))
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [isPlaying, fps, maxLen])

  // ── Export ─────────────────────────────────────────────────────────────────
  async function exportVideo() {
    if (isExporting) return
    setIsExporting(true)
    setIsPlaying(false)
    try {
      await exportWebm(tracksRef.current, fps, bgsRef.current)
    } finally {
      setIsExporting(false)
    }
  }

  // ── AI chat ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = chatScrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, aiLoading])

  async function sendMessage(textOverride?: string) {
    const text = (textOverride ?? draft).trim()
    if (!text || aiLoading) return
    setMessages((m) => [...m, { role: "user", text }])
    setDraft("")
    setAiLoading(true)
    const reply = (t: string, failedPrompt?: string) =>
      setMessages((m) => [...m, { role: "assistant", text: t, failedPrompt }])
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 90_000)
    try {
      const history = messages
        .filter((m) => !m.failedPrompt)
        .slice(-8)
        .map((m) => ({ role: m.role, text: m.text }))
      const res = await fetch(aiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          fps,
          currentScene: lastScene.current,
          history,
        }),
        signal: controller.signal,
      })
      const scene: AiScene & { error?: string } = await res.json()
      if (!res.ok || scene.error) {
        reply(scene.error || "Generation failed.", text)
        return
      }

      if (scene.operation === "clear") {
        snapshot()
        setIsPlaying(false)
        setSelectedId(null)
        setTracks([makeTrack("Track 1")])
        setActiveTrack(0)
        setCurrent(0)
        lastScene.current = null
        reply("Cleared all frames.")
        return
      }

      const baked = bakeScene(scene, fps)
      if (!baked.length || !baked.some((f) => f.shapes.length)) {
        reply("The animation came back empty — try rephrasing.", text)
        return
      }

      snapshot()
      if (scene.operation === "append") {
        const base = framesRef.current
        setFrames([...base, ...baked])
        setCurrent(base.length)
      } else {
        setFrames(baked)
        setCurrent(0)
      }
      setSelectedId(null)
      lastScene.current = scene
      reply(
        `Built a ${scene.durationSeconds}s animation — ${baked.length} frames at ${fps} fps. Press ▶ to play, or keep refining it here.`
      )
    } catch (err) {
      reply(
        err instanceof DOMException && err.name === "AbortError"
          ? "The request timed out. Try again?"
          : "Request failed. Is the AI endpoint reachable?",
        text
      )
    } finally {
      clearTimeout(timer)
      setAiLoading(false)
    }
  }

  const effScale = baseScale * zoom

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "relative flex h-full min-h-[440px] w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-foreground",
        className
      )}
    >
      {/* hand-drawn distortion filter */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="animate-hand">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02 0.03"
              numOctaves="2"
              seed="7"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Header: [insert/tools + history + zoom] [frame counter] [playback+export] */}
      <header className="grid grid-cols-3 items-center border-b border-border px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShapesOpen(true)}
            title="Insert a shape or template"
            className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background hover:opacity-90"
          >
            <Plus className="size-3.5" /> Add
          </button>
          <HeaderBtn
            onClick={() => setTool((t) => (t === "draw" ? "select" : "draw"))}
            title="Pencil — draw freehand (B)"
            active={tool === "draw"}
            bordered
          >
            <Pencil className="size-4" />
          </HeaderBtn>
          <div className="mx-1.5 h-5 w-px bg-border" />
          <HeaderBtn onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
            <Undo2 className="size-4" />
          </HeaderBtn>
          <HeaderBtn onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
            <Redo2 className="size-4" />
          </HeaderBtn>
          <div className="mx-1.5 h-5 w-px bg-border" />
          <HeaderBtn onClick={() => zoomBy(1 / 1.25)} title="Zoom out">
            <ZoomOut className="size-4" />
          </HeaderBtn>
          <button
            onClick={resetView}
            className="min-w-12 cursor-pointer rounded-md px-1 py-1 text-center font-mono text-[11px] tabular-nums text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Reset zoom & pan"
          >
            {Math.round(zoom * 100)}%
          </button>
          <HeaderBtn onClick={() => zoomBy(1.25)} title="Zoom in">
            <ZoomIn className="size-4" />
          </HeaderBtn>
          <HeaderBtn onClick={resetView} title="Fit to view">
            <Maximize2 className="size-4" />
          </HeaderBtn>
        </div>
        <span className="justify-self-center font-mono text-xs text-muted-foreground">
          {tracks[safeActive].name} · frame{" "}
          <span className="text-foreground">{current + 1}</span> / {maxLen}
        </span>
        <div className="flex items-center justify-end gap-2">
          <select
            value={fps}
            onChange={(e) => setFps(+e.target.value)}
            className="cursor-pointer rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground outline-none"
            title="Frame rate"
          >
            {FRAME_RATES.map((r) => (
              <option key={r} value={r}>
                {r} fps
              </option>
            ))}
          </select>
          <HeaderBtn
            onClick={() => setOnion((o) => !o)}
            title="Onion skin (O)"
            active={onion}
            bordered
          >
            <Layers className="size-4" />
          </HeaderBtn>
          <HeaderBtn
            onClick={() => setGotoOpen(true)}
            title="Go to a second or frame"
            bordered
          >
            <Clock className="size-4" />
          </HeaderBtn>
          <HeaderBtn
            onClick={() => setIsPlaying((p) => !p)}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            bordered
          >
            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
          </HeaderBtn>
          {AI_ENABLED && (
            <HeaderBtn
              onClick={() => setChatOpen((c) => !c)}
              title="Ask AI"
              active={chatOpen}
              bordered
            >
              <MessageSquare className="size-4" />
            </HeaderBtn>
          )}
          <button
            onClick={exportVideo}
            disabled={isExporting}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background disabled:opacity-50"
          >
            <Download className="size-3.5" />
            {isExporting ? "Exporting…" : "Download"}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 max-md:flex-col">
        {/* Shapes, upload and templates now live in a modal (the top + button);
            the canvas fills the freed-up width. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="hidden"
        />

        {/* Center: fixed 800×450 artboard, scaled to fit + zoom/pan */}
        <div
          ref={stageRef}
          className="relative grid flex-1 place-items-center overflow-hidden bg-muted/30"
        >
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${effScale})`,
            }}
          >
            <div
              ref={canvasRef}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onPointerDown={(e) => {
                if (tool === "draw" && !isPlaying) {
                  e.preventDefault()
                  const p = toLocal(e.clientX, e.clientY)
                  drawRef.current = [p.x, p.y]
                  setDrawPts([p.x, p.y])
                  return
                }
                if (e.target === e.currentTarget) setSelectedId(null)
              }}
              className={cn(
                "relative overflow-hidden shadow-lg ring-1 ring-black/10",
                tool === "draw" && "cursor-crosshair"
              )}
              style={{
                width: CW,
                height: CH,
                backgroundColor: curBg,
                backgroundImage: grid
                  ? "radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)"
                  : undefined,
                backgroundSize: grid ? "20px 20px" : undefined,
              }}
            >
              {/* onion skin ghosts (active track only) */}
              {onion &&
                !isPlaying &&
                editIndex > 0 &&
                activeFrames[editIndex - 1].shapes.map((s) => (
                  <ShapeView key={`prev-${s.id}`} shape={s} ghost />
                ))}
              {onion &&
                !isPlaying &&
                editIndex < activeFrames.length - 1 &&
                activeFrames[editIndex + 1].shapes.map((s) => (
                  <ShapeView key={`next-${s.id}`} shape={s} ghost />
                ))}

              {/* tracks composite bottom-to-top (array index 0 = top layer);
                  only the active track's shapes respond to the pointer */}
              {[...tracks].reverse().map((t, ri) => {
                const ti = tracks.length - 1 - ri
                if (!t.visible) return null
                return trackFrameAt(t, current).shapes.map((s) => (
                  <ShapeView
                    key={`${t.id}-${s.id}`}
                    shape={s}
                    onSelect={ti === safeActive ? onShapePointerDown : undefined}
                  />
                ))
              })}

              {selected && !isPlaying && tool !== "draw" && (
                <SelectionBox
                  shape={selected}
                  onResizeStart={(corner, e) => {
                    const p = toLocal(e.clientX, e.clientY)
                    resizeState.current = {
                      id: selected.id,
                      corner,
                      ox: selected.x,
                      oy: selected.y,
                      ow: selected.w,
                      oh: selected.h,
                      px: p.x,
                      py: p.y,
                      moved: false,
                    }
                  }}
                />
              )}

              {/* live freehand stroke */}
              {drawPts && drawPts.length >= 2 && (
                <svg
                  className="pointer-events-none absolute inset-0"
                  width={CW}
                  height={CH}
                >
                  <path
                    d={pointsToPath(drawPts)}
                    fill="none"
                    stroke="#111827"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}

              {tracks.every(
                (t) => !t.visible || trackFrameAt(t, current).shapes.length === 0
              ) &&
                !drawPts && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-neutral-400">
                    Press + to add a shape, ✏ to draw, or ask AI
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Right: properties (a bottom sheet on mobile) */}
        <aside className="w-60 shrink-0 overflow-y-auto border-l border-border p-3 max-md:h-[38%] max-md:w-full max-md:border-l-0 max-md:border-t">
          {!selected ? (
            <CanvasProperties
              bg={curBg}
              onBg={setBgAt}
              grid={grid}
              onGrid={setGrid}
              onion={onion}
              onOnion={setOnion}
            />
          ) : (
            <Properties
              shape={selected}
              onChange={updateShape}
              onDelete={deleteShape}
              onReorder={reorder}
              onTextAnim={applyTextAnim}
            />
          )}
        </aside>

        {/* Far right: AI chat (a full overlay on mobile) */}
        {AI_ENABLED && chatOpen && (
          <aside className="flex w-72 shrink-0 flex-col border-l border-border max-md:absolute max-md:inset-0 max-md:z-40 max-md:w-full max-md:border-l-0 max-md:bg-card">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-sm font-semibold">Ask AI</span>
              <button
                onClick={() => setChatOpen(false)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div ref={chatScrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
              {messages.length === 0 && (
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Describe an animation and AI will build the frames. Then keep
                    chatting to refine it (“make the ball red”, “add 2 seconds”).
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {AI_SUGGESTIONS.map((sug) => (
                      <button
                        key={sug}
                        onClick={() => sendMessage(sug)}
                        className="cursor-pointer rounded-lg border border-border px-2.5 py-1.5 text-left text-[11px] text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-xs",
                      m.role === "user"
                        ? "ml-auto bg-foreground text-background"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {m.text}
                  </div>
                  {m.failedPrompt && (
                    <button
                      onClick={() => sendMessage(m.failedPrompt)}
                      className="mt-1 cursor-pointer rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      ↻ Retry
                    </button>
                  )}
                </div>
              ))}
              {aiLoading && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="size-3.5 animate-pulse" /> Generating…
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 border-t border-border p-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing)
                    sendMessage()
                }}
                placeholder="Ask AI to create…"
                className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-foreground/40"
              />
              <button
                onClick={() => sendMessage()}
                disabled={aiLoading}
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md bg-foreground text-background disabled:opacity-50"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Timeline */}
      <Timeline
        tracks={tracks}
        activeTrack={safeActive}
        current={current}
        fps={fps}
        bgs={bgs}
        tab={timelineTab}
        onTab={setTimelineTab}
        onSelect={setCurrent}
        onSelectTrack={(ti) => {
          setActiveTrack(ti)
          setSelectedId(null)
        }}
        onAddFrame={addFrame}
        onDeleteFrame={deleteFrame}
        onAddTrack={addTrack}
        onDeleteTrack={deleteTrack}
        onToggleTrack={toggleTrack}
        onMoveTrack={moveTrack}
        onFrameContextMenu={(ti, i, e) => {
          e.preventDefault()
          setActiveTrack(ti)
          setSelectedId(null)
          setCurrent(i)
          setMenu({ x: e.clientX, y: e.clientY, frame: i })
        }}
      />

      {/* Timeline context menu */}
      {menu && (
        <div
          style={{ position: "fixed", left: menu.x, top: menu.y }}
          onClick={(e) => e.stopPropagation()}
          className="z-50 w-52 overflow-hidden rounded-lg border border-border bg-popover py-1 text-sm shadow-xl"
        >
          {(
            [
              "Copy frame",
              "Paste frame",
              "Paste to next 10 frames",
              "Duplicate frame",
              "Delete frame",
            ] as const
          ).map((label) => (
            <button
              key={label}
              onClick={() => {
                const i = menu.frame
                if (label === "Copy frame") copyFrame(i)
                else if (label === "Paste frame") pasteFrame(i)
                else if (label === "Paste to next 10 frames") pasteToNext(i, 10)
                else if (label === "Duplicate frame") duplicateFrame(i)
                else deleteFrame(i)
                setMenu(null)
              }}
              className="block w-full cursor-pointer px-3 py-1.5 text-left hover:bg-muted"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Insert modal: shapes + upload + animation templates */}
      {shapesOpen && (
        <div
          onPointerDown={() => setShapesOpen(false)}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-popover p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Insert</span>
              <button
                onClick={() => setShapesOpen(false)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <span className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
              Shapes
            </span>
            <div className="grid grid-cols-6 gap-2">
              {SHAPE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.type}
                  title={tpl.label}
                  onClick={() => {
                    addShapeToCurrent(createShape(tpl.type, CW / 2, CH / 2))
                    setShapesOpen(false)
                  }}
                  className="flex aspect-square cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                >
                  {tpl.icon}
                </button>
              ))}
              <button
                title="Upload image / logo"
                onClick={() => {
                  setShapesOpen(false)
                  fileInputRef.current?.click()
                }}
                className="flex aspect-square cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              >
                <ImagePlus className="size-4" />
              </button>
            </div>

            <span className="mb-1.5 mt-4 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <LayoutTemplate className="size-3.5" /> Templates
            </span>
            <div className="space-y-0.5">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p.gen)}
                  className="flex w-full cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-muted"
                >
                  <span className="mt-0.5 text-muted-foreground">{p.icon}</span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      {p.name}
                      {p.fromLibrary && (
                        <span className="rounded bg-indigo-500/15 px-1 py-px text-[9px] font-semibold text-indigo-500">
                          Library
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-[10px] text-muted-foreground">
                      {p.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Go-to modal: jump to a second or frame (materialises frames up to it) */}
      {gotoOpen && (
        <div
          onPointerDown={() => setGotoOpen(false)}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <form
            onPointerDown={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault()
              const n = parseFloat(gotoVal)
              if (!Number.isFinite(n)) return
              goTo(gotoMode === "second" ? n * fps : n - 1)
              setGotoVal("")
            }}
            className="w-full max-w-xs rounded-2xl border border-border bg-popover p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Go to</span>
              <button
                type="button"
                onClick={() => setGotoOpen(false)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mb-2 flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
              {(["second", "frame"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setGotoMode(m)}
                  className={cn(
                    "flex-1 cursor-pointer rounded-md px-2 py-1 text-xs font-medium capitalize",
                    gotoMode === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              autoFocus
              type="number"
              step={gotoMode === "second" ? 0.1 : 1}
              min={gotoMode === "second" ? 0 : 1}
              value={gotoVal}
              onChange={(e) => setGotoVal(e.target.value)}
              placeholder={gotoMode === "second" ? "e.g. 5.5" : "e.g. 25"}
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-foreground/40"
            />
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              {gotoMode === "second"
                ? `At ${fps} fps · 1s = ${fps} frames.`
                : "Frame number (1-based)."}{" "}
              Frames up to there are created if needed.
            </p>
            <button
              type="submit"
              className="mt-3 w-full cursor-pointer rounded-md bg-foreground py-1.5 text-xs font-medium text-background"
            >
              Go
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function HeaderBtn({
  children,
  onClick,
  title,
  disabled,
  active,
  bordered,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  disabled?: boolean
  active?: boolean
  bordered?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-muted disabled:cursor-default disabled:opacity-35",
        bordered && "border border-border",
        active && "bg-muted"
      )}
    >
      {children}
    </button>
  )
}
