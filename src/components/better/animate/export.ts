import { getPhosphorUrl, imageCache, preloadIcons, preloadImages } from "./icons"
import {
  type Frame,
  type FpsSegment,
  type Shape,
  type Track,
  CH,
  CW,
  bgAt,
  effectsFilter,
  fpsAt,
  heartSegments,
  hexagonPoints,
  starPoints,
  trackFrameAt,
  tracksLength,
} from "./types"

// CSS mix-blend-mode → canvas globalCompositeOperation (same keywords).
const CANVAS_BLEND: Record<string, GlobalCompositeOperation> = {
  multiply: "multiply",
  screen: "screen",
  overlay: "overlay",
  darken: "darken",
  lighten: "lighten",
  "color-dodge": "color-dodge",
  difference: "difference",
  exclusion: "exclusion",
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  w: number,
  h: number,
  bg = "#ffffff"
) {
  ctx.clearRect(0, 0, w, h)
  if (bg !== "transparent") {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
  }
  for (const s of frame.shapes) drawShape(ctx, s)
}

/**
 * Composite all visible tracks at global frame index `index`.
 * Track order matches a layers panel: index 0 is the TOP layer, so we paint
 * from the end of the array (bottom) to the start (top).
 */
export function drawComposite(
  ctx: CanvasRenderingContext2D,
  tracks: Track[],
  index: number,
  w: number,
  h: number,
  bg = "#ffffff"
) {
  ctx.clearRect(0, 0, w, h)
  if (bg !== "transparent") {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
  }
  for (let i = tracks.length - 1; i >= 0; i--) {
    const t = tracks[i]
    if (!t.visible || !t.frames.length) continue
    for (const s of trackFrameAt(t, index).shapes) drawShape(ctx, s)
  }
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function polyPath(ctx: CanvasRenderingContext2D, pts: [number, number][], ox: number, oy: number) {
  ctx.beginPath()
  pts.forEach(([px, py], i) =>
    i === 0 ? ctx.moveTo(ox + px, oy + py) : ctx.lineTo(ox + px, oy + py)
  )
  ctx.closePath()
}

function heartPath(ctx: CanvasRenderingContext2D, s: Shape) {
  const seg = heartSegments(s.w, s.h)
  ctx.beginPath()
  ctx.moveTo(s.x + seg.start[0], s.y + seg.start[1])
  for (const c of seg.curves)
    ctx.bezierCurveTo(
      s.x + c.c1[0],
      s.y + c.c1[1],
      s.x + c.c2[0],
      s.y + c.c2[1],
      s.x + c.to[0],
      s.y + c.to[1]
    )
  ctx.closePath()
}

export function drawShape(ctx: CanvasRenderingContext2D, s: Shape) {
  ctx.save()
  ctx.globalAlpha = s.opacity
  const blend = CANVAS_BLEND[s.blendMode]
  if (blend) ctx.globalCompositeOperation = blend
  const fx = effectsFilter(s)
  if (fx) {
    try {
      ctx.filter = fx
    } catch {
      /* older engines without ctx.filter */
    }
  }
  const cx = s.x + s.w / 2
  const cy = s.y + s.h / 2
  if (s.rotation || s.flipX || s.flipY) {
    ctx.translate(cx, cy)
    if (s.rotation) ctx.rotate((s.rotation * Math.PI) / 180)
    ctx.scale(s.flipX ? -1 : 1, s.flipY ? -1 : 1)
    ctx.translate(-cx, -cy)
  }

  if (s.type === "image") {
    const img = imageCache.get(s.src)
    if (img) {
      if (s.radius) {
        roundRectPath(ctx, s.x, s.y, s.w, s.h, s.radius)
        ctx.clip()
      }
      ctx.drawImage(img, s.x, s.y, s.w, s.h)
      if (s.strokeWidth) {
        ctx.lineWidth = s.strokeWidth
        ctx.strokeStyle = s.stroke
        ctx.strokeRect(s.x, s.y, s.w, s.h)
      }
    }
    ctx.restore()
    return
  }

  const fillStyle = () => {
    if (s.transparentFill) return null
    if (s.texture === "gradient") {
      const a = (s.gradAngle * Math.PI) / 180
      const dx = Math.sin(a)
      const dy = -Math.cos(a)
      const len = (Math.abs(dx) * s.w + Math.abs(dy) * s.h) / 2
      const g = ctx.createLinearGradient(
        cx - dx * len,
        cy - dy * len,
        cx + dx * len,
        cy + dy * len
      )
      g.addColorStop(0, s.gradFrom)
      g.addColorStop(1, s.gradTo)
      return g
    }
    return s.fill
  }
  const fs = fillStyle()

  if (s.type === "line") {
    roundRectPath(ctx, s.x, s.y, s.w, Math.max(1, s.h), s.radius)
    ctx.fillStyle = fs ?? s.fill
    ctx.fill()
    ctx.restore()
    return
  }

  if (s.type === "draw") {
    const p = s.points
    if (p.length >= 2) {
      ctx.strokeStyle = s.fill
      ctx.lineWidth = Math.max(1, s.strokeWidth || 3)
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()
      ctx.moveTo(s.x + p[0], s.y + p[1])
      for (let i = 2; i < p.length - 1; i += 2) ctx.lineTo(s.x + p[i], s.y + p[i + 1])
      ctx.stroke()
    }
    ctx.restore()
    return
  }

  if (s.type === "arrow") {
    const t = Math.max(2, s.strokeWidth || 5)
    const head = Math.min(s.w * 0.35, s.h)
    const mid = s.y + s.h / 2
    ctx.strokeStyle = s.fill
    ctx.lineWidth = t
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(s.x, mid)
    ctx.lineTo(s.x + Math.max(1, s.w - head * 0.8), mid)
    ctx.stroke()
    ctx.fillStyle = s.fill
    ctx.beginPath()
    ctx.moveTo(s.x + s.w, mid)
    ctx.lineTo(s.x + s.w - head, Math.max(s.y, mid - head / 2))
    ctx.lineTo(s.x + s.w - head, Math.min(s.y + s.h, mid + head / 2))
    ctx.closePath()
    ctx.fill()
    ctx.restore()
    return
  }

  if (s.type === "triangle") {
    ctx.beginPath()
    ctx.moveTo(s.x + s.w / 2, s.y)
    ctx.lineTo(s.x + s.w, s.y + s.h)
    ctx.lineTo(s.x, s.y + s.h)
    ctx.closePath()
  } else if (s.type === "circle" || s.type === "oval") {
    ctx.beginPath()
    ctx.ellipse(cx, cy, s.w / 2, s.h / 2, 0, 0, Math.PI * 2)
  } else if (s.type === "star") {
    polyPath(ctx, starPoints(s.w, s.h), s.x, s.y)
  } else if (s.type === "hexagon") {
    polyPath(ctx, hexagonPoints(s.w, s.h), s.x, s.y)
  } else if (s.type === "heart") {
    heartPath(ctx, s)
  } else {
    roundRectPath(ctx, s.x, s.y, s.w, s.h, s.radius)
  }

  if (fs) {
    ctx.fillStyle = fs
    ctx.fill()
  }
  if (s.strokeWidth) {
    ctx.lineWidth = s.strokeWidth
    ctx.strokeStyle = s.stroke
    ctx.lineJoin = "round"
    ctx.stroke()
  }

  if (!s.transparentFill && s.texture === "dithering") {
    ctx.clip()
    ctx.fillStyle = s.ditherColor
    const step = s.ditherSize
    for (let py = s.y; py < s.y + s.h; py += step) {
      for (let px = s.x; px < s.x + s.w; px += step) {
        ctx.beginPath()
        ctx.arc(px + step / 2, py + step / 2, step * 0.28, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  } else if (
    !s.transparentFill &&
    (s.texture === "noise" || s.texture === "paper")
  ) {
    ctx.clip()
    const count = Math.floor(((s.w * s.h) / 3) * s.noiseFreq)
    for (let i = 0; i < count; i++) {
      const g = Math.floor(Math.random() * 255)
      ctx.fillStyle = `rgba(${g},${g},${g},${s.noiseOpacity * 0.5})`
      ctx.fillRect(
        s.x + Math.random() * s.w,
        s.y + Math.random() * s.h,
        1.4,
        1.4
      )
    }
  }

  if (s.type === "icon" && s.iconName) {
    const url = getPhosphorUrl(s.iconName, s.fill)
    const img = url ? imageCache.get(url) : undefined
    if (img) {
      const sz = Math.min(s.w, s.h)
      ctx.drawImage(img, s.x + (s.w - sz) / 2, s.y + (s.h - sz) / 2, sz, sz)
    }
  } else if (s.type === "text" || s.type === "button" || s.type === "icon") {
    const label = s.type === "icon" ? s.glyph : s.text
    ctx.fillStyle = s.type === "button" ? "#ffffff" : s.fill
    ctx.font = `600 ${s.fontSize}px ${s.type === "icon" ? "system-ui, sans-serif" : s.fontFamily}`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(label, cx, cy)
  }
  ctx.restore()
}

/**
 * Render every composited frame to an offscreen canvas and record an HD webm.
 * `segments` (optional) apply per-frame custom fps; frames outside them use `fps`.
 */
export async function exportWebm(
  tracks: Track[],
  fps: number,
  bgs: string[],
  segments: FpsSegment[] = []
) {
  const allFrames = tracks.flatMap((t) => (t.visible ? t.frames : []))
  await preloadImages(allFrames)
  await preloadIcons(allFrames)
  await document.fonts.ready

  const sc = 1080 / CH
  const cvs = document.createElement("canvas")
  cvs.width = Math.round(CW * sc) // 1920
  cvs.height = Math.round(CH * sc) // 1080
  const ctx = cvs.getContext("2d")!
  ctx.scale(sc, sc)

  const mime = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ].find((m) => MediaRecorder.isTypeSupported(m))!
  // Capture at the highest rate any segment needs so fast frames aren't dropped.
  const peakFps = Math.max(fps, ...segments.map((s) => s.fps))
  const stream = cvs.captureStream(peakFps)
  const track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack
  const rec = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: 12_000_000,
  })
  const chunks: Blob[] = []
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
  const stopped = new Promise<void>((res) => (rec.onstop = () => res()))
  rec.start()

  const total = tracksLength(tracks)
  const ticks = total > 1 ? total : Math.round(2 * fps)
  for (let i = 0; i < ticks; i++) {
    const f = i % total
    drawComposite(ctx, tracks, f, CW, CH, bgAt(bgs, f))
    // Nudge the capture track so no frame is dropped by the wall-clock sampler.
    track.requestFrame?.()
    await new Promise((r) => setTimeout(r, 1000 / fpsAt(fps, segments, f)))
  }
  rec.stop()
  await stopped

  const blob = new Blob(chunks, { type: "video/webm" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "animation.webm"
  a.click()
  URL.revokeObjectURL(url)
}
