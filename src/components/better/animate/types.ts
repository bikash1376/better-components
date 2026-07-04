// ─── Shared types & constants for the Animate editor ─────────────────────────

export type ShapeType =
  | "square"
  | "circle"
  | "rectangle"
  | "triangle"
  | "oval"
  | "star"
  | "heart"
  | "hexagon"
  | "line"
  | "arrow"
  | "button"
  | "icon"
  | "text"
  | "image"
  | "draw"

export type Texture =
  | "none"
  | "paper"
  | "noise"
  | "smooth"
  | "gradient"
  | "dithering"

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "difference"
  | "exclusion"

export type Corner = "nw" | "ne" | "sw" | "se"

export interface Shape {
  id: string
  /**
   * Whether this frame's instance of the shape is a user-set **keyframe**.
   * Tweening interpolates between keyframes and fills the frames in between
   * (which are marked `false`). Derived value-diffing can't be used because a
   * tweened prop changes every frame — so keyframes must be tracked explicitly.
   */
  key: boolean
  type: ShapeType
  x: number
  y: number
  w: number
  h: number
  rotation: number
  opacity: number
  fill: string
  transparentFill: boolean
  stroke: string
  strokeWidth: number
  radius: number
  hand: boolean
  text: string
  glyph: string
  iconName: string
  fontSize: number
  fontFamily: string
  src: string
  /** Freehand stroke points for `draw` shapes, flattened [x0,y0,x1,y1,…] relative to (x,y). */
  points: number[]
  texture: Texture
  gradFrom: string
  gradTo: string
  gradAngle: number
  noiseFreq: number
  noiseOpacity: number
  ditherSize: number
  ditherColor: string
  // ── Effects ──
  blur: number
  shadow: boolean
  shadowX: number
  shadowY: number
  shadowBlur: number
  shadowColor: string
  blendMode: BlendMode
  brightness: number // 1 = normal
  contrast: number // 1 = normal
  saturate: number // 1 = normal
  hueRotate: number // degrees
  grayscale: number // 0..1
  flipX: boolean
  flipY: boolean
}

export interface Frame {
  id: string
  shapes: Shape[]
}

/**
 * A track is an independent frame sequence. Tracks composite bottom-to-top
 * on the canvas (like layers), each playing its own frames; shorter tracks
 * hold their last frame while longer ones continue.
 */
export interface Track {
  id: string
  name: string
  visible: boolean
  frames: Frame[]
}

export interface ChatMessage {
  role: "user" | "assistant"
  text: string
  /** Set when the request failed — enables a Retry affordance. */
  failedPrompt?: string
}

// Fixed logical artboard — every coordinate (editor, AI, export) is in this space.
export const CW = 800
export const CH = 450

export const FRAME_RATES = [12, 24, 30, 60]
export const MAX_FRAMES = 1200

/**
 * A custom frame-rate segment: frames `start`…`end` (1-based, inclusive) play
 * at `fps`. Segments must not overlap. Frames outside every segment fall back
 * to the timeline's base fps.
 */
export interface FpsSegment {
  start: number
  end: number
  fps: number
}

/** Effective fps for global frame index `i` (0-based): first covering segment, else base. */
export function fpsAt(base: number, segments: FpsSegment[], i: number): number {
  const f = i + 1 // segments are authored 1-based
  for (const s of segments) if (f >= s.start && f <= s.end) return s.fps
  return base
}

/** Seconds elapsed before frame `i` (0-based) given per-frame fps. */
export function timeAt(base: number, segments: FpsSegment[], i: number): number {
  let t = 0
  for (let k = 0; k < i; k++) t += 1 / fpsAt(base, segments, k)
  return t
}

/** Total playback duration in seconds for `total` frames under per-frame fps. */
export function totalDuration(
  base: number,
  segments: FpsSegment[],
  total: number
): number {
  return timeAt(base, segments, total)
}

/** Validate fps segments: positive fps, start<=end, no overlaps. Returns an error string or null. */
export function validateSegments(segments: FpsSegment[]): string | null {
  const sorted = [...segments].sort((a, b) => a.start - b.start)
  for (const s of sorted) {
    if (!Number.isFinite(s.start) || !Number.isFinite(s.end) || s.start < 1)
      return "Frame numbers must be 1 or greater."
    if (s.end < s.start) return "End frame must be ≥ start frame."
    if (s.fps < 1 || s.fps > 240) return "FPS must be between 1 and 240."
  }
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start <= sorted[i - 1].end)
      return `Segments overlap at frame ${sorted[i].start}.`
  }
  return null
}

export const TEXTURES: Texture[] = [
  "none",
  "smooth",
  "paper",
  "noise",
  "gradient",
  "dithering",
]

export const BLEND_MODES: BlendMode[] = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "difference",
  "exclusion",
]

export const GLYPHS = ["★", "♥", "●", "▲", "✚", "✦", "☀", "⚡", "✔", "◆"]

export const FONTS: { label: string; css: string }[] = [
  { label: "Geist", css: "'Geist', sans-serif" },
  { label: "Inter", css: "'Inter', sans-serif" },
  { label: "Instrument Serif", css: "'Instrument Serif', serif" },
  { label: "Playfair Display", css: "'Playfair Display', serif" },
  { label: "Pinyon Script", css: "'Pinyon Script', cursive" },
]

export const fontCss = (label?: string) =>
  FONTS.find((f) => f.label === label)?.css ?? FONTS[0].css

export const uid = () => Math.random().toString(36).slice(2, 9)

/**
 * Copy a frame's shapes for propagation into another frame. Ids are kept stable
 * so "the same" shape keeps one identity across frames — that's what lets
 * `tweenFrames` match a shape between its keyframes. Only one frame per track
 * renders at a time, so shared ids across frames never collide, and every edit
 * op (patch/delete/reorder) is scoped to the current frame index anyway.
 */
export const cloneShapes = (shapes: Shape[]) =>
  shapes.map((s) => ({ ...s, key: false }))

export const emptyFrame = (): Frame => ({ id: uid(), shapes: [] })

export const makeTrack = (name: string): Track => ({
  id: uid(),
  name,
  visible: true,
  frames: [emptyFrame()],
})

/** Frame a track shows at global index `i` (shorter tracks hold their last frame). */
export const trackFrameAt = (t: Track, i: number): Frame =>
  t.frames[Math.max(0, Math.min(i, t.frames.length - 1))]

export const tracksLength = (tracks: Track[]) =>
  Math.max(1, ...tracks.map((t) => t.frames.length))

// ─── Auto-keyframing / tweening ──────────────────────────────────────────────
// Every animatable shape prop interpolates between poses like a video editor:
// numeric props lerp, colour props lerp channel-wise, discrete props (type,
// text, texture, flips, booleans, font…) step at the keyframe.

/** Numeric shape props that interpolate linearly between keyframes. */
export const NUM_TWEEN_KEYS = [
  "x", "y", "w", "h", "rotation", "opacity", "radius", "strokeWidth",
  "fontSize", "blur", "shadowX", "shadowY", "shadowBlur", "brightness",
  "contrast", "saturate", "hueRotate", "grayscale", "gradAngle", "noiseFreq",
  "noiseOpacity", "ditherSize",
] as const
/** Colour props that interpolate channel-wise (hex, incl. 8-digit alpha). */
export const COLOR_TWEEN_KEYS = [
  "fill", "stroke", "gradFrom", "gradTo", "shadowColor", "ditherColor",
] as const
export type NumTweenKey = (typeof NUM_TWEEN_KEYS)[number]
export type ColorTweenKey = (typeof COLOR_TWEEN_KEYS)[number]
/** All shape props that auto-keyframe — used to decide when an edit is a keyframe. */
export const ANIM_KEYS = [...NUM_TWEEN_KEYS, ...COLOR_TWEEN_KEYS] as const

function parseHex(hex: string): [number, number, number, number] | null {
  let h = hex.trim().replace(/^#/, "")
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  if (h.length === 6) h += "ff"
  if (h.length !== 8 || /[^0-9a-fA-F]/.test(h)) return null
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
    parseInt(h.slice(6, 8), 16),
  ]
}
const hx = (c: number) =>
  Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")

/** Interpolate two hex colours. Falls back to a hard switch if either can't be parsed. */
export function lerpColor(a: string, b: string, t: number): string {
  const pa = parseHex(a)
  const pb = parseHex(b)
  if (!pa || !pb) return t < 0.5 ? a : b
  const r = hx(pa[0] + (pb[0] - pa[0]) * t)
  const g = hx(pa[1] + (pb[1] - pa[1]) * t)
  const bl = hx(pa[2] + (pb[2] - pa[2]) * t)
  const al = Math.round(pa[3] + (pb[3] - pa[3]) * t)
  return al >= 255 ? `#${r}${g}${bl}` : `#${r}${g}${bl}${hx(al)}`
}

/** SVG path data for a flattened point list [x0,y0,x1,y1,…] (freehand `draw` shapes). */
export function pointsToPath(points: number[]): string {
  if (points.length < 2) return ""
  let d = `M ${points[0]} ${points[1]}`
  for (let i = 2; i < points.length - 1; i += 2) d += ` L ${points[i]} ${points[i + 1]}`
  return d
}

/** Interpolate one shape between poses `a` and `b` at fraction `t` (discrete props follow `b`). */
function interpShape(s: Shape, a: Shape, b: Shape, t: number): Shape {
  const next = { ...s, key: false } // a filled in-between frame is never a keyframe
  for (const k of NUM_TWEEN_KEYS) next[k] = a[k] + (b[k] - a[k]) * t
  for (const k of COLOR_TWEEN_KEYS) next[k] = lerpColor(a[k], b[k], t)
  return next
}

/** Index of the nearest keyframe strictly before `n` for value list `at` (0 if none). */
function prevKeyframe<T>(
  n: number,
  at: (i: number) => T | undefined,
  changed: (cur: T, prev: T) => boolean
): number {
  for (let i = n - 1; i >= 1; i--) {
    const cur = at(i)
    if (cur === undefined) return i + 1 // value absent here → its run starts next
    const prev = at(i - 1)
    if (prev === undefined) return i // appears at i
    if (changed(cur, prev)) return i // change point
  }
  return 0
}

/**
 * Video-editor-style auto-keyframing. After a shape (matched by `id`) is edited
 * on frame `current` — moved, resized, rotated, recoloured, restyled — fill in
 * every frame between it and the nearest earlier **keyframe** (a frame flagged
 * `key`, or where the shape first appears). Frames before that keyframe and
 * after `current` are left untouched, so only the last edited segment re-tweens.
 * All animatable props interpolate together, so editing several props on the
 * same frame keeps filling the whole segment (keyframes are explicit `key`
 * flags, not value diffs — a tweened prop changes every frame).
 */
export function tweenFrames(
  frames: Frame[],
  id: string,
  current: number
): Frame[] {
  const n = Math.min(current, frames.length - 1)
  if (n <= 0) return frames
  const at = (i: number) => frames[i].shapes.find((s) => s.id === id)
  const end = at(n)
  if (!end) return frames
  const a = prevKeyframe(n, at, (cur) => cur.key)
  if (a >= n) return frames // no gap to fill
  const start = at(a)
  if (!start) return frames

  return frames.map((fr, i) => {
    if (i <= a || i >= n) return fr
    const t = (i - a) / (n - a)
    return {
      ...fr,
      shapes: fr.shapes.map((s) => (s.id === id ? interpShape(s, start, end, t) : s)),
    }
  })
}

/**
 * Apply a keyframe edit to shape `id` at frame `current`, filling **both**
 * directions like a video editor:
 *  - backward: tween from the previous keyframe up to `current`;
 *  - forward: if there's a later keyframe, tween across to it; otherwise the
 *    value **holds** (every following frame takes the new value) so the shape
 *    doesn't snap back to its old pose after the edited frame.
 */
export function applyKeyframe(
  frames: Frame[],
  id: string,
  current: number
): Frame[] {
  const n = Math.min(current, frames.length - 1)
  if (n < 0) return frames
  const held = frames[n].shapes.find((s) => s.id === id)
  if (!held) return frames

  // Backward: fill prevKeyframe..n.
  const out = tweenFrames(frames, id, n)

  // Find the next keyframe after n (stop if the shape's run ends first).
  let nextKf = -1
  for (let i = n + 1; i < out.length; i++) {
    const sh = out[i].shapes.find((s) => s.id === id)
    if (!sh) break
    if (sh.key) {
      nextKf = i
      break
    }
  }

  if (nextKf >= 0) return tweenFrames(out, id, nextKf) // forward: tween n..nextKf
  // No later keyframe → hold the new value forward to the end of the run.
  return out.map((fr, i) => {
    if (i <= n) return fr
    if (!fr.shapes.some((s) => s.id === id)) return fr
    return {
      ...fr,
      shapes: fr.shapes.map((s) => (s.id === id ? { ...held, key: false } : s)),
    }
  })
}

/**
 * Tween the document background colour between keyframes, the same way shapes
 * tween. After `bgs[current]` is set, interpolate every entry back to the
 * nearest earlier background keyframe. Returns a new array.
 */
export function tweenBgs(bgs: string[], current: number): string[] {
  const n = Math.min(current, bgs.length - 1)
  if (n <= 0) return bgs
  const a = prevKeyframe(n, (i) => bgs[i], (cur, prev) => cur !== prev)
  if (a >= n) return bgs
  return bgs.map((c, i) =>
    i <= a || i >= n ? c : lerpColor(bgs[a], bgs[n], (i - a) / (n - a))
  )
}

/** Read a per-frame background, holding the last value for out-of-range indices. */
export const bgAt = (bgs: string[], i: number) =>
  bgs[Math.max(0, Math.min(i, bgs.length - 1))] ?? "#ffffff"

/** Pad/trim a per-frame background array to `len`, holding the last colour. */
export function padBgs(bgs: string[], len: number): string[] {
  if (bgs.length === len) return bgs
  const last = bgs[bgs.length - 1] ?? "#ffffff"
  const next = bgs.slice(0, len)
  while (next.length < len) next.push(last)
  return next
}

export function makeShape(p: Partial<Shape> & { type: ShapeType }): Shape {
  return {
    id: uid(),
    key: true, // a freshly placed shape is a keyframe where it sits
    x: 0,
    y: 0,
    w: 80,
    h: 80,
    rotation: 0,
    opacity: 1,
    fill: "#6366f1",
    transparentFill: false,
    stroke: "#312e81",
    strokeWidth: 0,
    radius: 0,
    hand: false,
    text: "",
    glyph: "★",
    iconName: "",
    fontSize: 16,
    fontFamily: FONTS[0].css,
    src: "",
    points: [],
    texture: "none",
    gradFrom: "#818cf8",
    gradTo: "#4338ca",
    gradAngle: 135,
    noiseFreq: 0.8,
    noiseOpacity: 0.4,
    ditherSize: 5,
    ditherColor: "#111827",
    blur: 0,
    shadow: false,
    shadowX: 0,
    shadowY: 6,
    shadowBlur: 12,
    shadowColor: "#0f172a66",
    blendMode: "normal",
    brightness: 1,
    contrast: 1,
    saturate: 1,
    hueRotate: 0,
    grayscale: 0,
    flipX: false,
    flipY: false,
    ...p,
  }
}

/** Default shape for a template dropped at artboard point (x, y). */
export function createShape(type: ShapeType, x: number, y: number): Shape {
  const common = {
    type,
    x: x - 40,
    y: y - 40,
    radius: type === "square" || type === "rectangle" ? 8 : 0,
    text: type === "button" ? "Button" : type === "text" ? "Text" : "",
    fontSize: type === "icon" ? 40 : 16,
  }
  if (type === "rectangle")
    return makeShape({ ...common, w: 130, h: 74, y: y - 37 })
  if (type === "oval")
    return makeShape({ ...common, w: 130, h: 84, x: x - 65, y: y - 42 })
  if (type === "circle") return makeShape({ ...common, radius: 999 })
  if (type === "star")
    return makeShape({ ...common, w: 90, h: 90, x: x - 45, y: y - 45, fill: "#f59e0b" })
  if (type === "heart")
    return makeShape({ ...common, w: 90, h: 80, x: x - 45, y: y - 40, fill: "#ef4444" })
  if (type === "hexagon")
    return makeShape({ ...common, w: 90, h: 80, x: x - 45, y: y - 40, fill: "#10b981" })
  if (type === "line")
    return makeShape({ ...common, w: 160, h: 6, x: x - 80, y: y - 3, fill: "#111827", radius: 3 })
  if (type === "arrow")
    return makeShape({ ...common, w: 160, h: 28, x: x - 80, y: y - 14, fill: "#111827", strokeWidth: 5 })
  if (type === "button")
    return makeShape({ ...common, w: 120, h: 46, y: y - 23, radius: 10, fill: "#111827" })
  if (type === "text")
    return makeShape({ ...common, w: 110, h: 44, transparentFill: true, fill: "#111827" })
  if (type === "icon")
    return makeShape({ ...common, w: 60, h: 60, transparentFill: true, fill: "#111827" })
  return makeShape(common)
}

// ─── Shared geometry & style helpers (DOM render + canvas export) ────────────

export function shade(hex: string, percent: number) {
  const n = parseInt(hex.replace("#", ""), 16)
  if (Number.isNaN(n)) return hex
  const clamp = (v: number) => Math.max(0, Math.min(255, v))
  const r = clamp(((n >> 16) & 255) + percent)
  const g = clamp(((n >> 8) & 255) + percent)
  const b = clamp((n & 255) + percent)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export const noiseUri = (freq: number, opacity: number) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='${opacity}'/%3E%3C/svg%3E")`

/** 5-point star vertices inside a w×h box. */
export function starPoints(w: number, h: number): [number, number][] {
  const cx = w / 2
  const cy = h / 2
  const outer = Math.min(w, h) / 2
  const inner = outer * 0.42
  const pts: [number, number][] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI / 5) * i - Math.PI / 2
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  // Stretch the circular star to fill the whole w×h box.
  const min = Math.min(w, h)
  return pts.map(([px, py]) => [cx + (px - cx) * (w / min), cy + (py - cy) * (h / min)])
}

/** Regular hexagon (flat top) vertices inside a w×h box. */
export function hexagonPoints(w: number, h: number): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6
    pts.push([w / 2 + (w / 2) * Math.cos(a), h / 2 + (h / 2) * Math.sin(a)])
  }
  return pts
}

/** Heart bezier segments in a unit 100×90 space, scaled to w×h. */
export function heartSegments(w: number, h: number) {
  const sx = w / 100
  const sy = h / 90
  const p = (x: number, y: number): [number, number] => [x * sx, y * sy]
  return {
    start: p(50, 90),
    curves: [
      { c1: p(50, 90), c2: p(0, 55), to: p(0, 27) },
      { c1: p(0, 10), c2: p(12, 0), to: p(26, 0) },
      { c1: p(37, 0), c2: p(46, 8), to: p(50, 18) },
      { c1: p(54, 8), c2: p(63, 0), to: p(74, 0) },
      { c1: p(88, 0), c2: p(100, 10), to: p(100, 27) },
      { c1: p(100, 55), c2: p(50, 90), to: p(50, 90) },
    ],
  }
}

export function heartSvgPath(w: number, h: number) {
  const seg = heartSegments(w, h)
  const c = seg.curves
    .map(
      (s) =>
        `C ${s.c1[0]},${s.c1[1]} ${s.c2[0]},${s.c2[1]} ${s.to[0]},${s.to[1]}`
    )
    .join(" ")
  return `M ${seg.start[0]},${seg.start[1]} ${c} Z`
}

/** CSS/canvas filter string for a shape's effects (excluding the hand-drawn SVG filter). */
export function effectsFilter(s: Shape): string {
  const parts: string[] = []
  if (s.blur > 0) parts.push(`blur(${s.blur}px)`)
  if (s.brightness !== 1) parts.push(`brightness(${s.brightness})`)
  if (s.contrast !== 1) parts.push(`contrast(${s.contrast})`)
  if (s.saturate !== 1) parts.push(`saturate(${s.saturate})`)
  if (s.hueRotate) parts.push(`hue-rotate(${s.hueRotate}deg)`)
  if (s.grayscale > 0) parts.push(`grayscale(${s.grayscale})`)
  if (s.shadow)
    parts.push(
      `drop-shadow(${s.shadowX}px ${s.shadowY}px ${s.shadowBlur}px ${s.shadowColor})`
    )
  return parts.join(" ")
}

/** Full CSS filter for DOM rendering (includes hand-drawn displacement). */
export function domFilter(s: Shape): string | undefined {
  const fx = effectsFilter(s)
  const hand = s.hand ? "url(#animate-hand)" : ""
  const all = `${hand} ${fx}`.trim()
  return all || undefined
}

export function shapeTransform(s: Shape): string | undefined {
  const parts: string[] = []
  if (s.rotation) parts.push(`rotate(${s.rotation}deg)`)
  if (s.flipX) parts.push("scaleX(-1)")
  if (s.flipY) parts.push("scaleY(-1)")
  return parts.length ? parts.join(" ") : undefined
}
