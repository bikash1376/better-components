"use client"

import { useMemo, useState } from "react"
import { createAvatar } from "@dicebear/core"
import {
  identicon,
  initials,
  lorelei,
  notionists,
  pixelArt,
  rings,
  shapes,
  thumbs,
} from "@dicebear/collection"
import { MeshGradient } from "@paper-design/shaders-react"

import { cn } from "@/lib/utils"

/**
 * DiceBear's code is MIT, but each art style carries its own license. Only
 * CC0 (public-domain) styles are exposed here, so shipping an avatar owes no
 * attribution to anyone. Do not add a CC-BY style (Adventurer, Micah, Personas,
 * …) without also rendering a visible credit to its designer.
 */
const DICEBEAR = {
  notionists,
  lorelei,
  "pixel-art": pixelArt,
  thumbs,
  shapes,
  rings,
  identicon,
  initials,
} as const

/** "gradient" is ours (paper.design shader); the rest are DiceBear CC0 styles. */
export const AVATAR_STYLES = ["gradient", ...Object.keys(DICEBEAR)] as const
export type AvatarStyle = (typeof AVATAR_STYLES)[number]

interface AvatarProps {
  /** Same seed → same avatar, always. Use a user id, email, or handle. */
  seed: string
  style?: AvatarStyle
  /** Side of the square avatar box, in px. */
  size?: number
  /** Rounded-full by default; set false for a squircle. */
  round?: boolean
  /** Gradient style only: 0 leaves the shader frozen on its first frame. */
  speed?: number
  className?: string
}

/** FNV-1a — a tiny, stable string hash so a seed always maps to the same look. */
function hash(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** h in degrees, s and l in 0-1. The shader wants hex, not `hsl()` strings. */
function hslToHex(h: number, s: number, l: number) {
  const a = s * Math.min(l, 1 - l)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0")
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

/**
 * Mulberry32 — a tiny PRNG. `hash` alone gives one 32-bit number, and slicing
 * it into fields (h >>> 9, h >>> 17, …) makes those fields share bits, so two
 * seeds that hash closely end up looking alike. Drawing successive values from
 * a PRNG keeps every knob independent.
 */
function rng(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Everything the mesh shader needs, all of it seeded. Colors alone are not
 * enough: the shape of the gradient comes from the distortion/swirl/rotation
 * knobs and from where in the animation it is frozen (`frame`). Two avatars
 * sharing a frame and differing only in hue read as the same avatar recolored.
 */
function gradientParams(seed: string) {
  const rand = rng(hash(seed))

  const base = rand() * 360
  const spread = 30 + rand() * 50
  const sat = 0.6 + rand() * 0.3
  const light = 0.44 + rand() * 0.16
  const colors = [0, 1, 2, 3].map((i) =>
    hslToHex((base + i * spread) % 360, sat, light - i * 0.03)
  )

  return {
    colors,
    distortion: 0.55 + rand() * 0.45,
    swirl: 0.25 + rand() * 0.65,
    rotation: rand() * 360,
    // Kept well inside ±1 so a spot never drifts off the tile and leaves a
    // flat corner.
    offsetX: (rand() - 0.5) * 0.7,
    offsetY: (rand() - 0.5) * 0.7,
    scale: 0.85 + rand() * 0.75,
    // The big one. At speed 0 the shader parks on this frame forever, so
    // without it every frozen avatar is the same composition.
    frame: rand() * 20000,
  }
}

/**
 * Avatar — a deterministic avatar from any seed string. Pick a DiceBear CC0
 * art style, or "gradient" for an abstract paper.design mesh shader. No network
 * call: everything renders locally.
 * Category: UI. Part of the Better Component library.
 */
export function Avatar({
  seed,
  style = "gradient",
  size = 64,
  round = true,
  speed = 0,
  className,
}: AvatarProps) {
  const uri = useMemo(() => {
    if (style === "gradient") return null
    return createAvatar(DICEBEAR[style as keyof typeof DICEBEAR], {
      seed,
      size,
    }).toDataUri()
  }, [seed, style, size])

  const gradient = useMemo(() => gradientParams(seed), [seed])

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "overflow-hidden bg-muted",
        round ? "rounded-full" : "rounded-2xl",
        className
      )}
    >
      {uri ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={uri}
          alt={`Avatar for ${seed}`}
          width={size}
          height={size}
          draggable={false}
          className="size-full select-none"
        />
      ) : (
        <MeshGradient
          colors={gradient.colors}
          speed={speed}
          frame={gradient.frame}
          distortion={gradient.distortion}
          swirl={gradient.swirl}
          rotation={gradient.rotation}
          offsetX={gradient.offsetX}
          offsetY={gradient.offsetY}
          scale={gradient.scale}
          className="size-full"
        />
      )}
    </div>
  )
}

const RANDOM_SEEDS = [
  "aurora",
  "bishop",
  "cobalt",
  "dune",
  "ember",
  "fig",
  "gale",
  "harbor",
  "indigo",
  "juno",
  "kite",
  "lumen",
]

interface AvatarPickerProps {
  /** Seed to start on; a random one is drawn if omitted. */
  defaultSeed?: string
  defaultStyle?: AvatarStyle
  /** Styles offered in the row of swatches. */
  styles?: readonly AvatarStyle[]
  size?: number
  /** Fires whenever the user lands on a different avatar. */
  onChange?: (value: { seed: string; style: AvatarStyle }) => void
  className?: string
}

/**
 * AvatarPicker — lets someone choose their avatar: swatches to switch art
 * style, and a shuffle to draw a new seed. Both are deterministic, so the
 * selection can be stored as just `{ seed, style }`.
 */
export function AvatarPicker({
  defaultSeed,
  defaultStyle = "gradient",
  styles = AVATAR_STYLES,
  size = 96,
  onChange,
  className,
}: AvatarPickerProps) {
  const [seed, setSeed] = useState(
    () => defaultSeed ?? RANDOM_SEEDS[Math.floor(Math.random() * RANDOM_SEEDS.length)]
  )
  const [style, setStyle] = useState<AvatarStyle>(defaultStyle)

  function select(next: { seed?: string; style?: AvatarStyle }) {
    const value = { seed: next.seed ?? seed, style: next.style ?? style }
    setSeed(value.seed)
    setStyle(value.style)
    onChange?.(value)
  }

  function shuffle() {
    // Random, but never the seed already on screen.
    let next = seed
    while (next === seed) {
      next = `${RANDOM_SEEDS[Math.floor(Math.random() * RANDOM_SEEDS.length)]}-${Math.floor(
        Math.random() * 1000
      )}`
    }
    select({ seed: next })
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <Avatar seed={seed} style={style} size={size} />

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {styles.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => select({ style: s })}
            aria-label={s}
            aria-pressed={s === style}
            className={cn(
              "cursor-pointer rounded-full p-0.5 ring-2 transition-colors",
              s === style ? "ring-foreground" : "ring-transparent hover:ring-border"
            )}
          >
            <Avatar seed={seed} style={s} size={32} />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={shuffle}
        className="cursor-pointer rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:bg-muted"
      >
        Shuffle
      </button>
    </div>
  )
}
