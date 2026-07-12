# Spec — next changes

Working notes for the next round of work on Better Components. Grouped by area,
each with the problem, the intended change, and acceptance criteria. Priority:
**P1** = broken/visible now, **P2** = feature gap, **P3** = larger effort.

> **Status (2026-07-02):** items **#1–#8 below are all shipped.** They're kept
> for reference. Current focus and newly shipped work are in
> [Latest](#latest--since-the-round-above) directly below; open work is in
> [Open / next](#open--next).

---

## Latest — since the round above

Shipped after the #1–#8 round:

- **New UI category** (badged "New"): **Static Button** (Apple-style pill, CVA,
  no motion), **Infinite Canvas** (windowed pannable icon grid — only on-screen
  tiles mount), **Paper** (textured surface). **Magnetic Card** (3D tilt + glare)
  added to Mouse.
- **Interactive playgrounds** across most components — a live preview + generated,
  copyable code + a controls sidebar (`src/components/site/playground.tsx`, opted
  in per component via `RegistryItem.playground`).
- **Docs page** (`/docs`) — install via the `@bettercomp` namespace, the full
  registry-JSON URL, or manual copy; nav links added on home + components pages.
- **Syntax highlighting** — `prism-react-renderer` with a theme driven by
  `--code-*` CSS vars so one theme adapts to light/dark
  (`src/components/site/code-block.tsx`), used in the code modal and playgrounds.
- **Registry publishing** — `pnpm registry:build` inlines each component's source
  into `public/r/*.json`; the registry URL is centralized in `src/lib/registry.ts`
  (`NEXT_PUBLIC_REGISTRY_URL`), so every install command/doc derives from one place.
- **Landing hero** — contained cover artwork with a gentle zoom-out on scroll.
- **`hidden` flag** on registry items — keeps source + direct `/components/<slug>`
  route but drops the item from gallery/search/sidebar and the published
  `registry.json` (currently: Typewriter Text, the Shaders category, Icon Wheel).
- **AI chat disabled** — see Open / next.
- **MIT license** added (`LICENSE`); GitHub source links point at the real repo
  (`bikash1376/better-components`).

---

## Open / next

### A. AI chat — hardening before re-enabling (P1, security)

**Problem:** The Animate editor's "Ask AI" feature is currently **disabled**
(`AI_ENABLED = false` in `src/components/better/animate/animate.tsx`) because
`/api/animate` is a **public, unauthenticated proxy to Mistral with no rate
limiting** — deployed as-is, anyone could loop it and burn the API key.

**Change (do all three before flipping `AI_ENABLED` back to `true`):**
1. **Rate limit `/api/animate`** — per-IP throttle (Upstash Ratelimit, or an
   in-memory token bucket for a single instance).
2. **Origin/Referer check** — reject requests that don't come from our own domain.
3. **Input caps** — clamp `prompt` length and the `history` / `currentScene`
   payload sizes (the route currently only checks `prompt` is a non-empty string).

**Files:** `src/app/api/animate/route.ts`, `src/components/better/animate/animate.tsx`.

**Done when:** the endpoint is rate-limited + origin-checked + size-capped, and
`AI_ENABLED` is `true` again with the chat working.

### B. Smaller cleanups (P2/P3)

- **Metadata / SEO:** `layout.tsx` title is `"Better Component"` (missing "s"),
  no `openGraph` / `metadataBase` / OG image — social shares preview blank.
- **Icon input sanitizing:** validate `iconName` (`/^[a-z0-9-]+$/`) and `fill`
  (hex) before building the Phosphor CDN URL / SVG in
  `src/components/better/animate/icons.tsx`.
- **npm name:** `bettercomp` / `@bettercomp` is not yet reserved on npm. The
  registry is served from `components.bksh.site`.

---

## 1. Text Shimmer — controls do nothing (P1, bug)

**Problem:** On `/components/text-shimmer` the playground `duration` and `spread`
sliders don't visibly change the preview.

**Change:** Make both controls live.
- `duration` should change the sweep speed. The animation is an infinite
  `backgroundPosition` loop; changing `transition.duration` mid-loop may not
  restart it. Fix by keying the motion element on `duration` (remount) or by
  driving the position with a motion value whose duration is read live.
- `spread` should change the highlight width (`dynamicSpread = children.length *
  spread`). Confirm the `--bg` CSS var actually updates on re-render.

**Files:** `src/components/better/text-shimmer.tsx`,
`src/components/site/playground.tsx` (`text-shimmer` config).

**Done when:** dragging `duration` visibly speeds up/slows the sweep and
`spread` visibly widens/narrows the highlight, with no console warnings.

---

## 2. Number Ticker — start value + prefix (P2)

**Problem:** Playground only exposes the end `value` and a `suffix`. There's no
**start** control, and there's no way to put the symbol at the **beginning**.

**Change:** The component already has `from` (start) and `prefix` props — expose
them in the playground.
- Add a `from` (start value) number control. End = `value` (already there).
- Add a `prefix` text control (renders before the number, e.g. `$`).
- Keep `suffix` (renders after, e.g. `+`, `%`).

**Files:** `src/components/site/playground.tsx` (`number-ticker` config only —
component already supports these).

**Done when:** playground has Start, End, Prefix, Suffix; `$` shows at the front
and `+`/`%` at the end; changing Start re-runs the count from that number.

---

## 3. Paper — real grain + hand-drawn / cutout / distorted (P2)

**Problem:** Current Paper is a light grain + emboss. The user wants a stronger,
more paper-like texture (visible grain/fibers) plus a **hand-drawn / cutout /
distorted** edge treatment, exposed as props and playground controls.

**Change:** Extend `Paper` using layered SVG filters (all client-side, no images):
- **Grain / fibers:** `feTurbulence type="fractalNoise"` overlay (already
  present) — add a separate higher-frequency *fiber* pass and expose `grain`
  (intensity) and `fibers` (0–1) instead of one `noise` knob.
- **Distorted / hand-drawn edges:** wrap the surface in `feTurbulence` +
  `feDisplacementMap` (the standard rough-edge recipe) so the outline wobbles.
  Expose `distort` (displacement `scale`) and `edge`:
  `"straight" | "handdrawn" | "torn" | "cutout"`.
  - `torn`/`cutout` → mask the container with a displaced rect so the border is
    ragged like torn paper.
- Keep existing `color`, `strength`, `radius`.

**Props (target):**
`{ color, grain=0.4, fibers=0.25, strength=0.6, radius=16, edge="straight",
distort=0 }`.

**Playground controls:** color, grain, fibers, strength, distort, edge (select),
radius.

**Reference technique:** feTurbulence for the grain, feTurbulence + feDisplacementMap
for the rough/torn edges (see References). Use `stitchTiles="stitch"` so the
grain tiles cleanly.

**Files:** `src/components/better/paper.tsx`, `registry.json`,
`src/components/site/playground.tsx`, `src/registry/index.tsx` (usage/demo).

**Done when:** grain is clearly visible and tunable; switching `edge` to
`torn`/`cutout` gives a ragged border; `distort` warps the surface edge.

---

## 4. Loaders — more Dots Loader controls + new loader components (P2/P3)

**Problem:** Dots Loader only has `size`. The user wants more controls and more
loader variants, using **zzzzshawn/matrix** (dotmatrix loaders) as inspiration.

**Change:**
- **Dots Loader controls:** add `count` (2–6), `gap`, `color`, `speed`
  (duration), and `bounce` (travel height). Expose all in the playground.
- **New loaders (new components, new "Loaders" gallery entries):** build a
  starter set of dot-matrix / geometric spinners in our own style, inspired by
  the matrix catalogue (do **not** copy their source — reimplement). Good first
  batch: a **grid pulse** (n×n dots pulsing in a wave), a **bar equalizer**
  (sound bars), an **orbit** (dots circling), a **ring spinner**, and a
  **wave/ladder**. Each: `size`, `color`, `speed`, plus its own knob (e.g. grid
  `rows/cols`, bars `count`). Give each a playground config.

**Files:** `src/components/better/dots-loader.tsx`, new
`src/components/better/<loader>.tsx` files, `src/registry/index.tsx`,
`registry.json`, `src/components/site/playground.tsx`.

**Done when:** Dots Loader is fully tunable and the Loaders category has several
new, distinct, configurable loaders each with a playground.

---

## 5. Marquee — slow-on-hover + fix the example code (P1/P2)

**Problems:**
1. Only `pauseOnHover` exists; user wants a **slow down** on hover option.
2. The playground/example code shows only `Motion / Design / Animate`, but the
   preview renders 5 pills (`… Export, Create`) — the code doesn't match what's
   on screen.

**Change:**
- Add `slowOnHover` (bool) and optionally `hoverSpeed` (e.g. 0.25×). Implement by
  swapping the animation-play-state/duration on `group-hover`. Keep
  `pauseOnHover`; if both set, pause wins (or make them one `hoverBehavior`
  select: `none | pause | slow`).
- Fix the `marquee` playground `code()` so the snippet is a complete, runnable
  component whose children match the preview exactly — include **Export** and
  **Create** (all five pills), the `import`, and `export function Example()`.

**Files:** `src/components/better/marquee.tsx`,
`src/components/site/playground.tsx` (`marquee` config).

**Done when:** hovering slows the scroll; the shown code renders the same five
pills you see in the preview.

---

## 6. Icon Tooltip — auto-hide duration (P2)

**Problem:** Tooltip shows on hover and hides on leave; there's no "display for N
ms then auto-hide" option.

**Change:** Add `duration` (ms). When set, after the tooltip opens, auto-hide it
after `duration` even if still hovered (clear the timer on leave/re-enter). Keep
existing `side` and `delay`. Add a `duration` control to the playground.

**Files:** `src/components/better/icon-tooltip.tsx`,
`src/components/site/playground.tsx` (`icon-tooltip` config).

**Done when:** with `duration=1500`, the tooltip appears (after `delay`), stays
~1.5s, then hides on its own.

---

## 7. Notification Card — proper Sileo-style system (P3)

**Problem:** The current single-card doesn't match **Sileo**
(sileo.aaryan.design): types, spring physics, stacking, swipe-to-dismiss, a
`<Toaster>` + imperative `toast()` API.

**Change:** Rebuild as a small toast system. Rather than start from scratch,
**adapt shadcn's toast pattern (sonner, MIT)** as the base and layer Sileo-style
behaviour on top (reimplement, don't paste):
- **Toaster** provider with `position` (`top-right`, etc.) and an imperative
  `toast()` / `toast.success/error/warning/info/promise(...)` API.
- **Toast types:** success, error, warning, info, action, promise, icon — each
  with an accent + icon (reuse our `accent` map).
- **Physics/stacking:** spring entrance/exit, stacked collapse, expand on hover,
  swipe-to-dismiss (drag x → dismiss past a threshold, motion `drag`).
- Keep the current `NotificationCard` as the standalone visual (already
  Sileo-flavoured); the new work is the stacking/toaster layer + types.
- Playground: keep the single-card controls; optionally a "fire toast" demo.

**Files:** new `src/components/better/toast.tsx` (Toaster + toast()),
`src/components/better/notification-card.tsx` (reused as the toast body),
`src/registry/index.tsx`, `registry.json`, `src/components/site/playground.tsx`.

**Licensing note:** sonner and Sileo are MIT — fine to adapt with attribution;
reimplement in our style, keep a credit comment.

**Done when:** firing multiple toasts stacks them with spring physics, they can
be swiped away, types render with the right accent/icon, and position is
configurable.

---

## 8. Animate — mobile / portrait editor (P3, large)

**Problem:** The Animate editor (`src/components/better/animate/`) is
desktop-only; on a phone it's unusable. Target the portrait layout of
**Alight Motion / VN** — canvas up top, timeline + tool rows stacked below.

**Change (responsive pass):**
- **Layout:** below `md`, switch from the side-by-side desktop layout to a
  vertical stack: canvas (fit-to-width, letterboxed) on top; a scrollable
  **timeline** strip; a **bottom toolbar** of tools; properties open as a
  bottom sheet, not a side panel.
- **Touch:** pointer events already used for drag/resize — verify pinch-zoom and
  one-finger pan on the canvas; make hit targets ≥ 44px; move keyboard-only
  actions (nudge, step) onto on-screen buttons.
- **Panels:** properties / timeline-tabs / AI chat become slide-up sheets with a
  drag handle; only one open at a time.
- **Export/AI:** keep working; make the buttons reachable in the bottom bar.

**Files:** `src/components/better/animate/*` (mainly `animate.tsx` layout,
`timeline.tsx`, `properties.tsx`), plus the detail-page `fullBleed` wrapper.

**Done when:** on a phone-width viewport the editor is a usable portrait layout
(canvas + timeline + bottom tools + bottom-sheet panels) with touch pan/zoom;
desktop layout is unchanged.

---

## Suggested order

1. **P1 quick wins:** #1 Text Shimmer, #5 Marquee (code + slow-on-hover).
2. **P2 props:** #2 Number Ticker, #6 Tooltip duration, #4 Dots Loader controls.
3. **P2/P3 builds:** #3 Paper textures, #4 new loaders.
4. **P3 large:** #7 Toast system, #8 Animate mobile.

## References

- Paper grain / rough edges — SVG `feTurbulence` + `feDisplacementMap`:
  - [Codrops — Creating Texture with feTurbulence](https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/)
  - [Rough CSS borders with SVG filters](https://bengammon.co.uk/rough-css-borders-with-svg-filters/)
  - [MDN — feTurbulence](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence)
  - [freeCodeCamp — Grainy CSS backgrounds with SVG filters](https://www.freecodecamp.org/news/grainy-css-backgrounds-using-svg-filters/)
- Loaders inspiration — [zzzzshawn/matrix](https://github.com/zzzzshawn/matrix) · [live docs](https://dotmatrix.zzzzshawn.cloud) (dotmatrix-style; reimplement, don't copy).
- Notifications — [Sileo](https://sileo.aaryan.design) (MIT) and [sonner](https://sonner.emilkowal.ski/) (shadcn's toast, MIT) as the adaptation base.
