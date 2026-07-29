# 001 — What's there

A snapshot of the current state of **Better Components**: what it is, what it
ships, and the tech behind it. Written 2026-07-03, updated 2026-07-04 (Animate
editor overhaul) from `README.md`, `SPEC.md`, and the codebase. For the *next*
round of work see [`SPEC.md`](../SPEC.md).

---

## What it is

Better Components is two things in one Next.js app:

1. **A copy-paste React component library** — animated components distributed
   shadcn-style. You browse a gallery, copy the source (or a usage snippet), and
   paste it into your own project. There's no npm package to install; components
   ship as a hosted **shadcn registry** (JSON served from `public/r/`).
2. **Animate** — a full browser-based motion design editor, itself shipped as one
   of the library's components (the "Apps" category).

Dark theme by default.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 16** (app router), **React 19** |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS 4** (`@tailwindcss/postcss`), `tw-animate-css`, `tailwind-merge` + `clsx` |
| Animation | **[motion](https://motion.dev)** (v12, the Framer Motion successor) |
| Variants | **class-variance-authority** (CVA) |
| UI primitives | **radix-ui** |
| Icons | **@phosphor-icons/react** (+ ~1,500 loaded on the fly in Animate), **lucide-react**, **@remixicon/react**, **react-icons** |
| Shaders | **@paper-design/shaders-react** (GPU shaders — Mesh Gradient, Neuro Noise, Metaballs) |
| Syntax highlighting | **prism-react-renderer** (theme-adaptive via `--code-*` CSS vars) |
| Theming | **next-themes** |
| AI (Animate) | **Vercel AI SDK** (`ai`) + **@ai-sdk/mistral** (`mistral-small-latest`, `generateObject`), **zod** for schema |
| Registry tooling | **shadcn** CLI (`pnpm registry:build` → `shadcn build`) |
| Lint | **ESLint 9** (`eslint-config-next`, React compiler rules) |
| Package manager | **pnpm** |

---

## The site

- **Docs** (`/docs`) — install guide: shadcn registry / `@bettercomp` namespace /
  manual copy.
- **Gallery** (`/components`) — components grouped by category with static
  "posters" that only animate on hover (keeps the page smooth). Apps + UI badged
  "New".
- **Component pages** (`/components/<slug>`) — install command plus either a live
  **Playground** (interactive controls → live props → live copyable code) or a
  static demo. Code modal has two tabs: **Auto** (paste-ready usage) and
  **Manual** (full source), syntax-highlighted.
- **Action dock** — macOS-style dock: theme toggle, icon-library switcher, code
  view, search (Ctrl+K), GitHub link.
- **Landing hero** — contained cover artwork with a scroll-driven zoom.

Site chrome lives in `src/components/site/` (`action-dock`, `component-sidebar`,
`gallery-card`, `playground`, `code-block`, `landing-hero`, `install-command`,
`theme-provider`, …).

---

## Components (by category)

Sourced from `src/registry/index.tsx`. Most have an interactive **playground**
(marked ▸).

| Category | Components |
| --- | --- |
| **Apps** *(New)* | **Animate** — the motion design editor (see below) |
| **UI** *(New)* | Static Button ▸ (Apple-style pill, CVA, no motion), Infinite Canvas ▸ (windowed pannable icon grid — only on-screen tiles mount), Paper ▸ (textured paper surface: fractal-noise grain, soft light, emboss) |
| **Typography** | Text Shimmer ▸ (gradient sweep), Number Ticker ▸ (springs to value on scroll-in) |
| **Stop Motion** | Stop Motion ▸ (jitter "boil"), Flipbook ▸ (choppy page snapping), Sketch Border ▸ (boiling hand-drawn border) |
| **Loaders** | Dots Loader ▸, Bar Loader ▸ (equalizer), Grid Pulse ▸ (dot-matrix wave), Ring Spinner ▸, Orbit Loader ▸ |
| **Carousel** | Marquee ▸ (infinite seamless scroller, edge fade) |
| **Mouse** | Magnetic Button ▸, Magnetic Card ▸ (3D tilt + glare), Icon Tooltip ▸, Toast (Toaster + imperative `toast()`, spring stacking, swipe-to-dismiss, types) |

### Temporarily hidden

Source + direct `/components/<slug>` URLs still resolve, but they're excluded from
the gallery, search, sidebar, and the published `registry.json` via a
`hidden: true` flag in `src/registry/index.tsx`:

- **Typewriter Text** (Typography)
- **Shaders** — the whole category: Mesh Gradient, Neuro Noise, Metaballs
- **Icon Wheel** (Mouse)

---

## Animate — the motion editor

A video-editor / motion-design / 2D-animator hybrid. Lives in
`src/components/better/animate/` (modular: `animate.tsx`, `types.ts`,
`render.tsx`, `export.ts`, `ai.ts`, `presets.tsx`, `text-anims.ts`,
`timeline.tsx`, `properties.tsx`, `icons.tsx`, `index.tsx`). Runs entirely in the
browser.

- **Canvas** — fixed 800×450 (16:9) artboard. Shapes are inserted from a top
  **+ Add** modal (squares, circles, stars, hearts, hexagons, lines, arrows,
  buttons, icons, text, images) — no more left sidebar; the canvas fills the
  freed width. A **Pencil** tool (`B`) draws freehand strokes as real `draw`
  shapes. Drag / resize / rotate, textures (gradient, noise, paper, dithering),
  hand-drawn edges, ~1,500 Phosphor icons loaded on demand.
- **Auto-keyframing (tweening)** — always on, video-editor style. Change *any*
  animatable property on a later frame and the editor fills the in-between
  frames: numeric props (position, size, rotation, opacity, radius, border width,
  blur, every effect, gradient angle, texture params) lerp; colours (fill,
  stroke, gradient, shadow, dither, **and the canvas background**) lerp
  channel-wise; discrete props (text, texture, flips) step. Keyframes are
  tracked **explicitly** (`Shape.key`), not inferred from value diffs, so editing
  several properties on one frame all fill the same segment. A keyframe edit
  fills **both** directions — tweens back to the previous keyframe and forward to
  the next (or **holds** the new value if it's the last), so nothing snaps back.
- **Prebuilt text animations** — select a text shape, move to a later frame, and
  apply one of 8 presets from the properties panel (Fade in, Rise up, Drop in,
  Woosh in, Pop, Blur in, Spin in, Typewriter). Baked as keyframes so they play
  *and* export (`text-anims.ts`).
- **Go to** — a clock button jumps to any second or frame, materialising the
  active track up to it (shapes carry forward) so you can pose + tween there.
- **Effects** — blur, drop shadow, blend modes, brightness / contrast /
  saturation / hue / grayscale, flip; live, tweenable, and in exports.
- **Multi-track timeline** — layered tracks (top row renders on top), each with
  its own frame sequence; shorter tracks hold their last frame. Two views:
  **Frames** (canvas thumbnails) and **Time** (second ruler + scrubbable playhead).
- **Ergonomics** — undo / redo (snapshots tracks + per-frame background),
  copy / paste / duplicate, arrow-key nudge, zoom-to-cursor + pan, onion skinning,
  frame context menu, per-frame canvas background + grid settings.
- **Templates** — one-click presets (Confetti, Ripple, Bounce, Pulse, Orbit) plus
  presets that recreate library components as editable frames (Text Shimmer, Dots
  Loader, Notification, Typewriter, Marquee).
- **AI chat** *(disabled by default — see below)* — describe an animation, a
  Mistral model plans objects + keyframes, the editor bakes them into frames at
  your fps; conversation-aware with retries and sanitized/clamped output.
- **Export** — HD 1920×1080 WebM, all tracks composited, per-frame background.

Shortcuts: `Space` play/pause · `[` `]` step · `Ctrl+Z/Y` undo/redo ·
`Ctrl+C/V/D` copy/paste/duplicate · arrows nudge (Shift = ×10) · `B` pencil ·
`O` onion skin · `Del` delete · `Ctrl+scroll` zoom.

**Data model note** — shape ids are **stable across frames** (a shape keeps one
identity so tweening can match it), and each per-frame shape instance carries a
`key` flag marking user-set keyframes. See `bettercomp-project.md` memory for the
architecture.

### AI chat is off

Gated behind `AI_ENABLED` (currently `false`) in `animate.tsx`. It's off because
`/api/animate` (`src/app/api/animate/route.ts`) is a **public, unauthenticated
proxy to Mistral with no rate limiting** — deployed as-is, anyone could loop it
and burn the API key. Re-enabling requires: per-IP rate limiting, an
Origin/Referer check, and input size caps (then set `MISTRAL_API_KEY`, flip the
flag). Tracked as **Open item A** in `SPEC.md`.

---

## Registry / distribution

- `registry.json` — the shadcn manifest, one entry per component (with npm deps).
- `pnpm registry:build` → `shadcn build` inlines each component's source into
  `public/r/<name>.json`; deployed, these serve at `https://<domain>/r/<name>.json`.
- `components.json` maps the `@bettercomp` namespace to that URL; the registry URL
  is centralized in `src/lib/registry.ts` (`NEXT_PUBLIC_REGISTRY_URL`), currently
  `components.useiota.space`.
- Install once deployed: `npx shadcn@latest add @bettercomp/static-button`.
- **Naming** — `better-components` is taken on npm, so the registry + namespace
  use `bettercomp` / `@bettercomp` (not yet reserved on npm).
- Hidden components are left out of `registry.json`, so they aren't published.

---

## Project structure

```
src/
  app/                    # app router pages + /api/animate (AI route)
    page.tsx  layout.tsx  docs/  components/[slug]/
  components/better/      # the component library (one file per component)
    animate/              # the Animate editor (modular)
  components/site/        # site chrome (dock, sidebar, gallery, playground, theme)
  lib/                    # registry.ts (registry URL), utils.ts
  registry/index.tsx      # component registry: categories, demos, usage, flags
registry.json             # shadcn registry manifest (pnpm registry:build)
components.json           # @bettercomp namespace → registry URL
```

## Scripts

- `pnpm dev` — dev server (localhost:3000)
- `pnpm build` — production build
- `pnpm lint` — ESLint (React compiler rules)
- `pnpm registry:build` — build the shadcn registry into `public/r/`

## License

[MIT](../LICENSE).
