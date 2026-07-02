import {
  Bell,
  CircleDashed,
  Keyboard,
  Loader,
  Orbit,
  PartyPopper,
  Sparkles,
  Type,
  Volleyball,
  Waves,
} from "lucide-react"

import {
  type Frame,
  type Shape,
  type ShapeType,
  CH,
  CW,
  FONTS,
  makeShape,
  uid,
} from "./types"

// ─── Preset / template animations ────────────────────────────────────────────
// Templates marked `fromLibrary` recreate Better Components as editable frames.

export interface Preset {
  name: string
  description: string
  icon: React.ReactNode
  fromLibrary?: boolean
  gen: () => Frame[]
}

const frame = (shapes: Shape[]): Frame => ({ id: uid(), shapes })

function confettiFrames(): Frame[] {
  const N = 14
  const P = 26
  const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899"]
  const parts = Array.from({ length: P }, (_, i) => ({
    id: uid(),
    type: (i % 2 ? "square" : "circle") as ShapeType,
    color: colors[i % colors.length],
    x0: 390 + (Math.random() - 0.5) * 70,
    vx: (Math.random() - 0.5) * 55,
    vy: -10 - Math.random() * 8,
    size: 8 + Math.random() * 10,
    rot0: Math.random() * 360,
    vr: (Math.random() - 0.5) * 50,
  }))
  return Array.from({ length: N }, (_, f) =>
    frame(
      parts.map((p) =>
        makeShape({
          id: p.id,
          type: p.type,
          x: p.x0 + p.vx * f,
          y: 150 + p.vy * f + 4.2 * f * f,
          w: p.size,
          h: p.size,
          fill: p.color,
          radius: p.type === "circle" ? 999 : 2,
          rotation: p.rot0 + p.vr * f,
        })
      )
    )
  )
}

function rippleFrames(): Frame[] {
  const N = 15
  return Array.from({ length: N }, (_, f) =>
    frame(
      [0, 1, 2]
        .map((k) => {
          const age = f - k * 4
          if (age < 0 || age > 11) return null
          const r = 20 + age * 22
          return makeShape({
            id: `ripple-${k}`,
            type: "circle",
            x: 400 - r,
            y: 225 - r,
            w: r * 2,
            h: r * 2,
            transparentFill: true,
            stroke: "#3b82f6",
            strokeWidth: Math.max(1, 6 - age * 0.5),
            radius: 999,
          })
        })
        .filter(Boolean) as Shape[]
    )
  )
}

/** Bouncing ball with squash & stretch and a soft ground shadow. */
function bounceFrames(): Frame[] {
  const N = 28
  const floor = 360
  return Array.from({ length: N }, (_, f) => {
    const t = f / (N - 1)
    const x = 60 + t * 620
    // Two decaying bounces.
    const phase = t * 2 * Math.PI
    const height = Math.abs(Math.sin(phase)) * (1 - t * 0.45) * 240
    const y = floor - height
    const impact = height < 14
    const w = impact ? 74 : 60
    const h = impact ? 46 : 60
    return frame([
      makeShape({
        id: "ball-shadow",
        type: "oval",
        x: x - 34 + 4,
        y: floor + 52,
        w: 68 * (1 - height / 320),
        h: 12 * (1 - height / 320),
        fill: "#0f172a",
        opacity: 0.18,
        blur: 3,
      }),
      makeShape({
        id: "ball",
        type: "circle",
        x: x - w / 2,
        y: y - h,
        w,
        h,
        fill: "#f43f5e",
        radius: 999,
        texture: "gradient",
        gradFrom: "#fb7185",
        gradTo: "#e11d48",
        gradAngle: 145,
      }),
    ])
  })
}

/** A pulsing dot emitting fading rings. */
function pulseFrames(): Frame[] {
  const N = 20
  return Array.from({ length: N }, (_, f) => {
    const t = f / N
    const core = 28 + Math.sin(t * Math.PI * 2) * 6
    const shapes: Shape[] = [0, 1].map((k) => {
      const age = (t + k * 0.5) % 1
      const r = 24 + age * 90
      return makeShape({
        id: `ring-${k}`,
        type: "circle",
        x: 400 - r,
        y: 225 - r,
        w: r * 2,
        h: r * 2,
        transparentFill: true,
        stroke: "#8b5cf6",
        strokeWidth: 3,
        radius: 999,
        opacity: Math.max(0, 1 - age),
      })
    })
    shapes.push(
      makeShape({
        id: "core",
        type: "circle",
        x: 400 - core / 2,
        y: 225 - core / 2,
        w: core,
        h: core,
        fill: "#8b5cf6",
        radius: 999,
        shadow: true,
        shadowX: 0,
        shadowY: 0,
        shadowBlur: 24,
        shadowColor: "#8b5cf6aa",
      })
    )
    return frame(shapes)
  })
}

/** Planets orbiting a sun. */
function orbitFrames(): Frame[] {
  const N = 36
  const planets = [
    { r: 90, size: 22, color: "#38bdf8", speed: 1 },
    { r: 150, size: 16, color: "#a78bfa", speed: -0.6 },
    { r: 200, size: 12, color: "#fb923c", speed: 0.35 },
  ]
  return Array.from({ length: N }, (_, f) => {
    const t = (f / N) * Math.PI * 2
    const shapes: Shape[] = planets.map((p, i) =>
      makeShape({
        id: `orbit-ring-${i}`,
        type: "circle",
        x: 400 - p.r,
        y: 225 - p.r,
        w: p.r * 2,
        h: p.r * 2,
        transparentFill: true,
        stroke: "#94a3b8",
        strokeWidth: 1,
        radius: 999,
        opacity: 0.35,
      })
    )
    shapes.push(
      makeShape({
        id: "sun",
        type: "circle",
        x: 400 - 26,
        y: 225 - 26,
        w: 52,
        h: 52,
        fill: "#facc15",
        radius: 999,
        shadow: true,
        shadowX: 0,
        shadowY: 0,
        shadowBlur: 30,
        shadowColor: "#facc15aa",
      })
    )
    planets.forEach((p, i) => {
      const a = t * p.speed + i * 2
      shapes.push(
        makeShape({
          id: `planet-${i}`,
          type: "circle",
          x: 400 + Math.cos(a) * p.r - p.size / 2,
          y: 225 + Math.sin(a) * p.r - p.size / 2,
          w: p.size,
          h: p.size,
          fill: p.color,
          radius: 999,
        })
      )
    })
    return frame(shapes)
  })
}

// ── Better Component templates ────────────────────────────────────────────────

/** Text Shimmer — a soft highlight sweeps across a title (library: text-shimmer). */
function shimmerFrames(): Frame[] {
  const N = 24
  return Array.from({ length: N }, (_, f) => {
    const t = f / (N - 1)
    const hx = -140 + t * (CW + 120)
    return frame([
      makeShape({
        id: "shimmer-bg",
        type: "rectangle",
        x: 0,
        y: 0,
        w: CW,
        h: CH,
        fill: "#0f172a",
        radius: 0,
      }),
      makeShape({
        id: "shimmer-text",
        type: "text",
        x: 190,
        y: 185,
        w: 420,
        h: 80,
        transparentFill: true,
        fill: "#64748b",
        text: "Better Components",
        fontSize: 44,
        fontFamily: FONTS[0].css,
      }),
      makeShape({
        id: "shimmer-glow",
        type: "oval",
        x: hx,
        y: 150,
        w: 150,
        h: 150,
        fill: "#e2e8f0",
        blur: 32,
        blendMode: "overlay",
        opacity: 0.9,
      }),
    ])
  })
}

/** Dots Loader — three dots bouncing in sequence (library: dots-loader). */
function dotsLoaderFrames(): Frame[] {
  const N = 18
  return Array.from({ length: N }, (_, f) => {
    const t = f / N
    return frame(
      [0, 1, 2].map((i) => {
        const phase = (t - i * 0.15) * Math.PI * 2
        const lift = Math.max(0, Math.sin(phase)) * 60
        return makeShape({
          id: `dot-${i}`,
          type: "circle",
          x: 336 + i * 52,
          y: 250 - lift,
          w: 26,
          h: 26,
          fill: "#111827",
          radius: 999,
        })
      })
    )
  })
}

/** Notification Card — a toast slides in, holds, slides out (library: notification-card). */
function notificationFrames(): Frame[] {
  const N = 40
  const cardW = 300
  const restX = CW - cardW - 28
  return Array.from({ length: N }, (_, f) => {
    const t = f / (N - 1)
    // ease-out entrance (0→0.2), hold, ease-in exit (0.8→1)
    let x: number
    let op = 1
    if (t < 0.2) {
      const e = 1 - Math.pow(1 - t / 0.2, 3)
      x = CW + 10 - (CW + 10 - restX) * e
    } else if (t > 0.8) {
      const e = Math.pow((t - 0.8) / 0.2, 3)
      x = restX + (CW + 20 - restX) * e
      op = 1 - e * 0.4
    } else {
      x = restX
    }
    return frame([
      makeShape({
        id: "toast-card",
        type: "rectangle",
        x,
        y: 40,
        w: cardW,
        h: 76,
        fill: "#ffffff",
        stroke: "#e2e8f0",
        strokeWidth: 1,
        radius: 14,
        opacity: op,
        shadow: true,
        shadowX: 0,
        shadowY: 10,
        shadowBlur: 24,
        shadowColor: "#0f172a33",
      }),
      makeShape({
        id: "toast-icon",
        type: "icon",
        x: x + 16,
        y: 40 + 20,
        w: 36,
        h: 36,
        transparentFill: true,
        fill: "#22c55e",
        iconName: "check-circle",
        opacity: op,
      }),
      makeShape({
        id: "toast-title",
        type: "text",
        x: x + 62,
        y: 40 + 16,
        w: 180,
        h: 22,
        transparentFill: true,
        fill: "#0f172a",
        text: "Payment received",
        fontSize: 16,
        opacity: op,
      }),
      makeShape({
        id: "toast-sub",
        type: "text",
        x: x + 62,
        y: 40 + 40,
        w: 170,
        h: 18,
        transparentFill: true,
        fill: "#64748b",
        text: "Invoice #1042 · just now",
        fontSize: 12,
        opacity: op,
      }),
    ])
  })
}

/** Typewriter — text typed out with a blinking caret (library: typewriter-text). */
function typewriterFrames(): Frame[] {
  const message = "Design in motion."
  const fontSize = 44
  const charW = 0.55 * fontSize
  const fullW = charW * message.length
  const x0 = (CW - fullW) / 2
  const framesOut: Frame[] = []
  const typed = message.length + 6 // extra frames for caret blink at the end
  for (let f = 0; f < typed; f++) {
    const count = Math.min(message.length, f + 1)
    const part = message.slice(0, count)
    const partW = charW * part.length
    const caretOn = f >= message.length ? f % 2 === 0 : true
    const shapes: Shape[] = [
      makeShape({
        id: "type-text",
        type: "text",
        // keep left edge fixed: box is centered, so shift by half the width
        x: x0,
        y: 200,
        w: partW,
        h: 60,
        transparentFill: true,
        fill: "#111827",
        text: part,
        fontSize,
        fontFamily: FONTS[2].css,
      }),
    ]
    if (caretOn)
      shapes.push(
        makeShape({
          id: "type-caret",
          type: "line",
          x: x0 + partW + 6,
          y: 202,
          w: 4,
          h: 52,
          fill: "#111827",
          radius: 2,
        })
      )
    framesOut.push(frame(shapes))
  }
  return framesOut
}

/** Marquee — a strip of labels scrolling forever (library: marquee). */
function marqueeFrames(): Frame[] {
  const N = 24
  const labels = ["Motion", "Design", "Animate", "Export", "Create"]
  const itemW = 190
  const total = labels.length * itemW
  return Array.from({ length: N }, (_, f) => {
    const offset = (f / N) * itemW * 2 // scrolls two items per loop for speed
    const shapes: Shape[] = []
    for (let i = -1; i < labels.length + 1; i++) {
      const idx = ((i % labels.length) + labels.length) % labels.length
      const x = ((i * itemW - offset) % total + total) % total - itemW
      shapes.push(
        makeShape({
          id: `mq-pill-${i}`,
          type: "rectangle",
          x,
          y: 200,
          w: itemW - 20,
          h: 52,
          fill: idx % 2 ? "#f1f5f9" : "#111827",
          radius: 26,
        }),
        makeShape({
          id: `mq-text-${i}`,
          type: "text",
          x,
          y: 212,
          w: itemW - 20,
          h: 28,
          transparentFill: true,
          fill: idx % 2 ? "#111827" : "#ffffff",
          text: labels[idx],
          fontSize: 20,
        })
      )
    }
    return frame(shapes)
  })
}

export const PRESETS: Preset[] = [
  {
    name: "Confetti",
    description: "A celebratory burst of falling pieces",
    icon: <PartyPopper className="size-4" />,
    gen: confettiFrames,
  },
  {
    name: "Ripple",
    description: "Expanding rings from the center",
    icon: <Waves className="size-4" />,
    gen: rippleFrames,
  },
  {
    name: "Bounce",
    description: "Ball with squash, stretch and shadow",
    icon: <Volleyball className="size-4" />,
    gen: bounceFrames,
  },
  {
    name: "Pulse",
    description: "A glowing dot emitting rings",
    icon: <CircleDashed className="size-4" />,
    gen: pulseFrames,
  },
  {
    name: "Orbit",
    description: "Planets circling a sun",
    icon: <Orbit className="size-4" />,
    gen: orbitFrames,
  },
  {
    name: "Text Shimmer",
    description: "Highlight sweeping across a title",
    icon: <Sparkles className="size-4" />,
    fromLibrary: true,
    gen: shimmerFrames,
  },
  {
    name: "Dots Loader",
    description: "Three dots bouncing in sequence",
    icon: <Loader className="size-4" />,
    fromLibrary: true,
    gen: dotsLoaderFrames,
  },
  {
    name: "Notification",
    description: "A toast card sliding in and out",
    icon: <Bell className="size-4" />,
    fromLibrary: true,
    gen: notificationFrames,
  },
  {
    name: "Typewriter",
    description: "Text typed out with a caret",
    icon: <Keyboard className="size-4" />,
    fromLibrary: true,
    gen: typewriterFrames,
  },
  {
    name: "Marquee",
    description: "Labels scrolling in a loop",
    icon: <Type className="size-4" />,
    fromLibrary: true,
    gen: marqueeFrames,
  },
]
