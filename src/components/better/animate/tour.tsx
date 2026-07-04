"use client"

import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

const STORAGE_KEY = "bettercomp-animate-tour-done"
/** Fire `window.dispatchEvent(new Event(TOUR_EVENT))` from anywhere to launch it. */
export const TOUR_EVENT = "bettercomp:start-tour"

type Step = {
  /** CSS selector for the element to spotlight (optional = centered card). */
  target?: string
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    title: "Welcome to Animate",
    body: "A tiny motion-design studio in your browser. Here's a 20-second tour of where everything lives.",
  },
  {
    target: '[data-tour="add"]',
    title: "Add shapes & templates",
    body: "Insert squares, text, icons, images — or drop in a ready-made animation template.",
  },
  {
    target: '[data-tour="pencil"]',
    title: "Draw freehand",
    body: "Grab the pencil (B) to sketch strokes right on the canvas. It paints black or white to match your theme.",
  },
  {
    target: '[data-tour="fps"]',
    title: "Frame rate",
    body: "Pick a global fps, or choose Custom… to give specific frame ranges their own speed.",
  },
  {
    target: '[data-tour="play"]',
    title: "Play & loop",
    body: "Press play (Space) to preview. The loop button just to its left toggles endless playback.",
  },
  {
    target: '[data-tour="properties"]',
    title: "Properties",
    body: "Select a shape to tweak size, color, effects and text animations. Change a property on a later frame and it tweens automatically.",
  },
  {
    target: '[data-tour="timeline"]',
    title: "Timeline",
    body: "Every frame and track lives here. Add frames, layer tracks, and scrub through time.",
  },
  {
    target: '[data-tour="export"]',
    title: "Export",
    body: "Happy with it? Download an HD WebM of your animation. That's it — go make something.",
  },
]

type Rect = { top: number; left: number; width: number; height: number }

function breatheAddButton() {
  const el = document.querySelector<HTMLElement>('[data-tour="add"]')
  if (!el) return
  el.classList.remove("tour-breathe")
  // reflow so the animation restarts if the class was just removed
  void el.offsetWidth
  el.classList.add("tour-breathe")
  window.setTimeout(() => el.classList.remove("tour-breathe"), 4600)
}

export function Tour({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)

  // Reset to the first step whenever the tour (re)opens — done during render,
  // the React-recommended alternative to a setState-in-effect.
  const [wasOpen, setWasOpen] = useState(false)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setStep(0)
  }

  // Auto-start once per browser, and let anything on the page (re)launch it via
  // a window event. Both just call a prop — safe inside an effect.
  useEffect(() => {
    if (typeof window === "undefined") return
    const launch = () => onOpenChange(true)
    window.addEventListener(TOUR_EVENT, launch)
    let t = 0
    if (!localStorage.getItem(STORAGE_KEY)) t = window.setTimeout(launch, 700)
    return () => {
      window.removeEventListener(TOUR_EVENT, launch)
      if (t) window.clearTimeout(t)
    }
  }, [onOpenChange])

  const finish = useCallback(
    (completed: boolean) => {
      try {
        localStorage.setItem(STORAGE_KEY, "1")
      } catch {
        /* private mode — fine */
      }
      onOpenChange(false)
      if (completed) breatheAddButton()
    },
    [onOpenChange]
  )

  // Measure the current target (and keep it fresh on resize/scroll).
  const measure = useCallback(() => {
    const sel = STEPS[step]?.target
    if (!sel) return setRect(null)
    const el = document.querySelector<HTMLElement>(sel)
    if (!el) return setRect(null)
    const r = el.getBoundingClientRect()
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [step])

  useLayoutEffect(() => {
    if (!open) return
    // Measuring the DOM target and syncing it into state is exactly what layout
    // effects are for; the strict compiler rule needs an explicit opt-out here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    measure()
    window.addEventListener("resize", measure)
    window.addEventListener("scroll", measure, true)
    return () => {
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
    }
  }, [open, measure])

  if (!open || typeof document === "undefined") return null

  const s = STEPS[step]
  const isLast = step === STEPS.length - 1
  const pad = 8

  // Card placement: below the target if it fits, otherwise above; centered when
  // there's no target.
  const CARD_W = 300
  let cardStyle: React.CSSProperties = {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: CARD_W,
  }
  if (rect) {
    const below = rect.top + rect.height + 12
    const room = window.innerHeight - below > 180
    const top = room ? below : Math.max(12, rect.top - 12)
    let left = rect.left + rect.width / 2 - CARD_W / 2
    left = Math.max(12, Math.min(left, window.innerWidth - CARD_W - 12))
    cardStyle = {
      position: "fixed",
      left,
      top,
      width: CARD_W,
      transform: room ? undefined : "translateY(-100%)",
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop: a spotlight hole over the target (or a plain dim if none). */}
      {rect ? (
        <div
          className="pointer-events-auto absolute rounded-lg ring-2 ring-foreground/70 transition-all duration-200"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          }}
        />
      ) : (
        <div className="pointer-events-auto absolute inset-0 bg-black/55" />
      )}

      {/* Step card */}
      <div
        style={cardStyle}
        className="pointer-events-auto rounded-2xl border border-border bg-popover p-4 shadow-2xl"
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold">{s.title}</span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {step + 1}/{STEPS.length}
          </span>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          {s.body}
        </p>

        {/* progress dots */}
        <div className="mb-3 flex items-center gap-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-foreground" : "bg-muted"
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => finish(false)}
            className="cursor-pointer text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStep((v) => Math.max(0, v - 1))}
              disabled={step === 0}
              className="cursor-pointer rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-medium hover:bg-muted disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => (isLast ? finish(true) : setStep((v) => v + 1))}
              className="cursor-pointer rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-medium text-background hover:opacity-90"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
