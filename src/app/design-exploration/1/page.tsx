"use client"

import { useRef, useState } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"

import { Avatar } from "@/components/better/avatar"
import { cn } from "@/lib/utils"

/**
 * A personal exploration, not a library component: it is deliberately absent
 * from registry.json so it never ships as a copy-pasteable item. Free to break
 * the library's rules here.
 */

const RESTING = 52
const MAGNIFIED = 96
/** How far from the cursor, in px, an avatar still feels the pull. */
const FALLOFF = 140

/** Tuned at 1x; SPEEDS rescales it without changing how bouncy it feels. */
const SPRING = { mass: 0.1, stiffness: 170, damping: 14 }

const SPEEDS = [0.25, 0.75, 1, 1.25, 1.5, 2] as const

/** Seeds only — every face is the paper.design mesh shader. */
const PEOPLE: { seed: string; label: string }[] = [
  { seed: "aurora", label: "Aurora" },
  { seed: "bishop", label: "Bishop" },
  { seed: "cobalt", label: "Cobalt" },
  { seed: "dune", label: "Dune" },
  { seed: "ember", label: "Ember" },
  { seed: "fig", label: "Fig" },
  // { seed: "gale", label: "Gale" },
  // { seed: "harbor", label: "Harbor" },
  // { seed: "indigo", label: "Indigo" },
  // { seed: "juno", label: "Juno" },
]

function DockAvatar({
  person,
  pointerX,
  speed,
  dark,
}: {
  person: (typeof PEOPLE)[number]
  pointerX: MotionValue<number>
  speed: number
  dark: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  // Signed px from the cursor to this avatar's center. Infinity while the
  // pointer is off the dock, which parks every avatar at its resting size.
  const distance = useTransform(pointerX, (x) => {
    const box = ref.current?.getBoundingClientRect()
    if (!box) return FALLOFF
    return x - (box.left + box.width / 2)
  })

  const target = useTransform(
    distance,
    [-FALLOFF, 0, FALLOFF],
    [RESTING, MAGNIFIED, RESTING],
    { clamp: true }
  )

  // Time-scaling a spring: frequency scales with sqrt(stiffness/mass), so
  // stiffness takes speed² and damping takes speed. That holds the damping
  // ratio constant, making 0.25x a true slow-motion replay of 1x rather than
  // a differently-bouncy animation.
  const size = useSpring(target, {
    mass: SPRING.mass,
    stiffness: SPRING.stiffness * speed * speed,
    damping: SPRING.damping * speed,
  })

  // The avatar itself renders once at MAGNIFIED and is scaled down, so the
  // shader never re-rasterizes mid-animation.
  const scale = useTransform(size, (s) => s / MAGNIFIED)

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative"
    >
      <motion.div
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
        transition={{ duration: 0.15 / speed }}
        className={cn(
          "pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border px-2 py-1 text-xs shadow-lg backdrop-blur",
          dark
            ? "border-white/10 bg-neutral-900/90 text-neutral-100"
            : "border-black/10 bg-white/90 text-neutral-900"
        )}
      >
        {person.label}
      </motion.div>

      <motion.div
        style={{
          width: MAGNIFIED,
          height: MAGNIFIED,
          scale,
          x: "-50%",
          originX: 0.5,
          originY: 1,
        }}
        className="absolute bottom-0 left-1/2"
      >
        <Avatar
          seed={person.seed}
          style="gradient"
          size={MAGNIFIED}
          speed={0.3 * speed}
          className="size-full shadow-lg"
        />
      </motion.div>
    </motion.div>
  )
}

export default function DesignExplorationOne() {
  const pointerX = useMotionValue(Infinity)
  const [speed, setSpeed] = useState(1)
  // Local rather than next-themes: the site provider defaults to dark and
  // persists globally, and this page wants white regardless of that.
  const [dark, setDark] = useState(false)

  return (
    <main
      className={cn(
        "flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-24 transition-colors duration-300",
        dark ? "bg-neutral-950" : "bg-white"
      )}
    >
      <div
        className={cn(
          "fixed inset-x-0 top-0 flex items-center justify-center gap-3 p-5 text-sm",
          dark ? "text-neutral-300" : "text-neutral-700"
        )}
      >
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          aria-label="Animation speed"
          className={cn(
            "cursor-pointer rounded-full border px-3 py-1.5 outline-none transition-colors",
            dark
              ? "border-white/15 bg-neutral-900 hover:bg-neutral-800"
              : "border-black/10 bg-neutral-50 hover:bg-neutral-100"
          )}
        >
          {SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}x
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          aria-label={dark ? "Switch to light" : "Switch to dark"}
          className={cn(
            "cursor-pointer rounded-full border px-3 py-1.5 transition-colors",
            dark
              ? "border-white/15 bg-neutral-900 hover:bg-neutral-800"
              : "border-black/10 bg-neutral-50 hover:bg-neutral-100"
          )}
        >
          {dark ? "Light" : "Dark"}
        </button>
      </div>

      <div
        // Remount on speed change: useSpring reads its config when the spring
        // is created, so an in-place change would not take effect.
        key={speed}
        onPointerMove={(e) => {
          // Ignore coarse pointers: a finger has no hover, so magnifying under
          // it would just hide the avatar being touched.
          if (e.pointerType === "mouse") pointerX.set(e.clientX)
        }}
        onPointerLeave={() => pointerX.set(Infinity)}
        className={cn(
          "flex cursor-pointer items-end gap-3 rounded-3xl border px-4 pb-3 pt-3 shadow-2xl backdrop-blur-xl transition-colors duration-300",
          dark ? "border-white/10 bg-white/5" : "border-black/5 bg-black/5"
        )}
        style={{ height: RESTING + 24 }}
      >
        {PEOPLE.map((person) => (
          <DockAvatar
            key={person.seed}
            person={person}
            pointerX={pointerX}
            speed={speed}
            dark={dark}
          />
        ))}
      </div>
    </main>
  )
}
