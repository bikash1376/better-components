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

/** Four analogous colors fanned out from a hue the seed picks. */
function gradientColors(seed: string) {
  const h = hash(seed)
  const base = h % 360
  const spread = 30 + ((h >>> 9) % 50)
  const sat = 0.6 + ((h >>> 17) % 30) / 100
  const light = 0.44 + ((h >>> 25) % 16) / 100
  return [0, 1, 2, 3].map((i) =>
    hslToHex((base + i * spread) % 360, sat, light - i * 0.03)
  )
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

  const colors = useMemo(() => gradientColors(seed), [seed])

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
          colors={colors}
          speed={speed}
          distortion={0.9}
          swirl={0.7}
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
