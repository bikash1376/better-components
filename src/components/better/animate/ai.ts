import {
  type BlendMode,
  type Frame,
  type Shape,
  type ShapeType,
  type Texture,
  BLEND_MODES,
  CH,
  CW,
  MAX_FRAMES,
  fontCss,
  makeShape,
  uid,
} from "./types"

// ─── AI scene → frames (keyframe baking with easing) ─────────────────────────
export type Ease = "linear" | "in" | "out" | "inout"

export interface AiKeyframe {
  at: number
  x: number
  y: number
  w: number
  h: number
  rotation: number
  opacity: number
  ease?: Ease
}

export interface AiObject {
  type: ShapeType
  fill: string
  stroke?: string
  strokeWidth?: number
  radius?: number
  texture?: Texture
  gradFrom?: string
  gradTo?: string
  gradAngle?: number
  hand?: boolean
  text?: string
  glyph?: string
  iconName?: string
  fontSize?: number
  fontFamily?: string
  blur?: number
  shadow?: boolean
  blendMode?: BlendMode
  keyframes: AiKeyframe[]
}

export interface AiScene {
  operation: "replace" | "append" | "clear"
  durationSeconds: number
  objects: AiObject[]
}

export function easeFn(name: Ease | undefined, t: number) {
  switch (name) {
    case "in":
      return t * t * t
    case "out":
      return 1 - Math.pow(1 - t, 3)
    case "linear":
      return t
    default:
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const num = (v: unknown, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback

function sampleObject(kfs: AiKeyframe[], t: number): AiKeyframe {
  const sorted = [...kfs].sort((a, b) => a.at - b.at)
  if (sorted.length === 1 || t <= sorted[0].at) return sorted[0]
  const last = sorted[sorted.length - 1]
  if (t >= last.at) return last
  let i = 0
  while (i < sorted.length - 1 && !(sorted[i].at <= t && t <= sorted[i + 1].at))
    i++
  const a = sorted[i]
  const b = sorted[i + 1]
  const span = b.at - a.at || 1
  const e = easeFn(b.ease, (t - a.at) / span)
  return {
    at: t,
    x: lerp(a.x, b.x, e),
    y: lerp(a.y, b.y, e),
    w: lerp(a.w, b.w, e),
    h: lerp(a.h, b.h, e),
    rotation: lerp(a.rotation, b.rotation, e),
    opacity: lerp(a.opacity, b.opacity, e),
  }
}

/** Drop keyframes with non-finite values so one bad number can't NaN a shape. */
function sanitizeKeyframes(kfs: AiKeyframe[] | undefined): AiKeyframe[] {
  if (!Array.isArray(kfs)) return []
  return kfs
    .filter(
      (k) =>
        k &&
        [k.at, k.x, k.y, k.w, k.h].every(
          (v) => typeof v === "number" && Number.isFinite(v)
        )
    )
    .map((k) => ({
      ...k,
      at: Math.max(0, Math.min(1, k.at)),
      rotation: num(k.rotation, 0),
      opacity: Math.max(0, Math.min(1, num(k.opacity, 1))),
    }))
}

export function bakeScene(scene: AiScene, fps: number): Frame[] {
  const total = Math.max(
    2,
    Math.min(MAX_FRAMES, Math.round((scene.durationSeconds || 2) * fps))
  )
  const objects = (scene.objects || [])
    .map((o) => ({ ...o, keyframes: sanitizeKeyframes(o.keyframes) }))
    .filter((o) => o.keyframes.length > 0)

  const frames: Frame[] = []
  for (let f = 0; f < total; f++) {
    const t = total > 1 ? f / (total - 1) : 0
    const shapes: Shape[] = objects.map((o) => {
      const k = sampleObject(o.keyframes, t)
      return makeShape({
        type: o.type,
        // Allow off-canvas positions (slide in/out) but keep them sane.
        x: Math.max(-CW, Math.min(CW * 2, k.x)),
        y: Math.max(-CH, Math.min(CH * 2, k.y)),
        w: Math.max(2, k.w),
        h: Math.max(2, k.h),
        rotation: k.rotation,
        opacity: Math.max(0, Math.min(1, k.opacity)),
        fill: o.fill || "#6366f1",
        stroke: o.stroke ?? "#312e81",
        strokeWidth: num(o.strokeWidth, 0),
        radius:
          o.radius ??
          (o.type === "circle" ? 999 : o.type === "button" ? 10 : 4),
        texture: o.texture ?? "none",
        gradFrom: o.gradFrom ?? "#818cf8",
        gradTo: o.gradTo ?? "#4338ca",
        gradAngle: num(o.gradAngle, 135),
        hand: o.hand ?? false,
        text: o.text ?? (o.type === "button" ? "Button" : ""),
        glyph: o.glyph || "★",
        iconName: (o.iconName || "").trim().toLowerCase(),
        fontSize: num(o.fontSize, o.type === "icon" ? 40 : 16),
        fontFamily: fontCss(o.fontFamily),
        transparentFill: o.type === "text" || o.type === "icon",
        blur: Math.max(0, Math.min(40, num(o.blur, 0))),
        shadow: o.shadow ?? false,
        blendMode:
          o.blendMode && BLEND_MODES.includes(o.blendMode)
            ? o.blendMode
            : "normal",
      })
    })
    frames.push({ id: uid(), shapes })
  }
  return frames
}
