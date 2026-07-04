import { type Shape } from "./types"

/**
 * Prebuilt text (and button) animations. Each one animates a text shape from a
 * lead-in state into its final pose over the frames between where the shape
 * first appears and the current frame — baked as keyframes so it plays in the
 * editor *and* exports to video (a runtime lib like GSAP/Framer couldn't export).
 *
 * - `from(final)` — the start-keyframe overrides; the tween fills to the final
 *   pose. Use for motion/opacity/scale/blur/rotation reveals.
 * - `reveal(full, p)` — a per-frame text substitution (typewriter-style); `p`
 *   goes 0→1 across the animation.
 */
export interface TextAnim {
  id: string
  label: string
  hint: string
  from?: (s: Shape) => Partial<Shape>
  reveal?: (full: string, p: number) => string
}

// How far off-screen a slide-in starts (artboard units).
const SLIDE = 320
const RISE = 140

export const TEXT_ANIMS: TextAnim[] = [
  {
    id: "fade",
    label: "Fade in",
    hint: "Fades up from transparent",
    from: () => ({ opacity: 0 }),
  },
  {
    id: "rise",
    label: "Rise up",
    hint: "Enters from below + fades in",
    from: (s) => ({ opacity: 0, y: s.y + RISE }),
  },
  {
    id: "drop",
    label: "Drop in",
    hint: "Enters from above + fades in",
    from: (s) => ({ opacity: 0, y: s.y - RISE }),
  },
  {
    id: "woosh",
    label: "Woosh in",
    hint: "Slides in fast from the left",
    from: (s) => ({ opacity: 0, x: s.x - SLIDE }),
  },
  {
    id: "pop",
    label: "Pop",
    hint: "Scales up from tiny",
    from: (s) => ({ opacity: 0, fontSize: Math.max(1, s.fontSize * 0.2) }),
  },
  {
    id: "blur",
    label: "Blur in",
    hint: "Sharpens from a blur",
    from: () => ({ opacity: 0, blur: 18 }),
  },
  {
    id: "spin",
    label: "Spin in",
    hint: "Rotates in + fades",
    from: (s) => ({ opacity: 0, rotation: s.rotation - 180 }),
  },
  {
    id: "type",
    label: "Typewriter",
    hint: "Reveals one character at a time",
    reveal: (full, p) => full.slice(0, Math.max(0, Math.round(full.length * p))),
  },
]
