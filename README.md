# Better Components

A library of animated, copy-paste React components — plus **Animate**, a browser-based motion design editor. Built with Next.js 16, React 19, Tailwind CSS 4, and [motion](https://motion.dev). Components are distributed shadcn-style: browse the gallery, copy the source (or the usage snippet), and paste it into your project.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

> **AI chat is disabled by default.** The Animate editor's "Ask AI" feature is turned off (see [AI chat](#ai-chat--disabled-by-default) below for how to re-enable it safely).

## The site

- **Docs** (`/docs`) — installation guide (shadcn registry / `@bettercomp` namespace / manual copy) and how to use components.
- **Gallery** (`/components`) — components grouped by category, with static "posters" that only animate on hover (so the page stays smooth). Apps and UI are labelled as new.
- **Component pages** (`/components/<slug>`) — title + description, install command, and either a live **Playground** (interactive controls → live props → live, copyable code) for components that define one, or a static live demo. Below that: a **Dependencies** list (from `registry.json`) and an auto-generated **Props** reference parsed from the component's `*Props` interfaces (`src/lib/props.ts` — JSDoc becomes the description, destructuring defaults become the Default column). A code modal offers two tabs: **Auto** (a ready-to-paste usage example) and **Manual** (the full component source). All code is syntax-highlighted (`prism-react-renderer`, theme-adaptive via `--code-*` CSS variables).
- **Action dock** — the macOS-style dock in the corner: theme toggle, icon-library switcher, code view, search (Ctrl+K), GitHub link.
- Dark theme by default.

## Component categories

| Category | Components |
| --- | --- |
| **Apps** | Animate — the motion design editor (see below) |
| **UI** | Static Button (Apple-style pill), Infinite Canvas (windowed pannable icon grid), Paper (textured paper surface), Avatar (deterministic DiceBear/shader avatars), Toast (Toaster + `toast()`) |
| **Typography** | Text Shimmer, Number Ticker |
| **Hand Drawn** | Stop Motion (jitter "boil"), Flipbook (choppy page snapping), Sketch Border (boiling hand-drawn border) |
| **Loaders** | Dots Loader, Bar Loader, Grid Pulse, Ring Spinner, Orbit Loader |
| **Carousel** | Marquee |
| **Mouse** | Magnetic Button, Magnetic Card (3D tilt), Icon Tooltip |

### Temporarily hidden

These are still in the codebase (source files intact, direct `/components/<slug>` URLs still resolve) but are excluded from the gallery, search, sidebar, and the published registry via a `hidden: true` flag in `src/registry/index.tsx`. Remove the flag to bring one back:

- **Typewriter Text** (Typography)
- **Shaders** — the whole category: Mesh Gradient, Neuro Noise, Metaballs
- **Icon Wheel** (Mouse)

## Animate — the motion design editor

A full frame-by-frame + keyframe motion editor that runs entirely in the browser (`src/components/better/animate/`):

- **Canvas**: fixed 800×450 (16:9) artboard, 13 shape types (squares, circles, stars, hearts, hexagons, lines, arrows, buttons, icons, text, images…) inserted from a top **+** modal, plus a **pencil** for freehand drawing; drag/resize/rotate, textures (gradient, noise, paper, dithering), hand-drawn edges, ~1,500 Phosphor icons loaded on the fly.
- **Effects**: blur, drop shadow, blend modes, brightness/contrast/saturation/hue/grayscale, flip — rendered live and in exports.
- **Auto-keyframing (tweening)**: always on, just like a video editor — change *any* animatable property (position, size, rotation, opacity, radius, border width, blur, all the effects, **and colours** — fill, stroke, gradient, shadow, even the canvas **background**) on a later frame and the editor interpolates every in-between frame back to the previous keyframe. Numeric props lerp, colours lerp channel-wise, discrete props (text, texture, flips…) step. Only the edited segment re-tweens; earlier keyframes are untouched. The end frame keeps your exact value.
- **Go to** (clock button): jump straight to any second or frame — frames up to there are created on the active track (carrying the shapes forward) so you can pose and tween at that point.
- **Multi-track timeline**: layered tracks (like a layers panel — top row renders on top), each with its own frame sequence; shorter tracks hold their last frame. Two timeline views: **Frames** (canvas thumbnails per track) and **Time** (second ruler with a scrubbable playhead).
- **Editor ergonomics**: undo/redo, copy/paste/duplicate shapes, arrow-key nudging, zoom-to-cursor + pan, onion skinning, frame context menu (copy/paste/paste-to-next-10/duplicate/delete), per-frame canvas background + grid settings.
- **Templates**: one-click animation presets (Confetti, Ripple, Bounce, Pulse, Orbit) plus presets that recreate library components as editable frames (Text Shimmer, Dots Loader, Notification, Typewriter, Marquee).
- **AI chat** _(disabled by default — see below)_: describe an animation ("a red ball bouncing") and a Mistral model plans objects + keyframes which the editor bakes into frames at your fps; keep chatting to refine ("make it red", "add 2 seconds"). Conversation-aware, with retries and sanitized output.
- **Export**: HD 1920×1080 WebM, all tracks composited.

Keyboard shortcuts: `Space` play/pause · `[` `]` step frames · `Ctrl+Z/Y` undo/redo · `Ctrl+C/V/D` copy/paste/duplicate · arrows nudge (Shift = ×10) · `B` pencil · `O` onion skin · `Del` delete · `Ctrl+scroll` zoom.

### AI chat — disabled by default

The "Ask AI" chat in the Animate editor is **turned off**. It's gated behind a single flag, `AI_ENABLED`, in `src/components/better/animate/animate.tsx`. While it's `false`, the toolbar button and the chat overlay are hidden; the rest of the editor works normally.

It's off because the AI route (`src/app/api/animate/route.ts`) is a **public, unauthenticated proxy to Mistral with no rate limiting** — deployed as-is, anyone who finds the endpoint could call it in a loop and burn through the API key. Before turning it back on you should:

1. **Add rate limiting to `/api/animate`** — per-IP throttling (e.g. Upstash Ratelimit, or an in-memory token bucket for a single instance).
2. **Check the request `Origin`/`Referer`** against your own domain to block casual cross-site abuse.
3. **Cap input size** — clamp `prompt` length and the `history` / `currentScene` payloads (the route currently only checks that `prompt` is a non-empty string).

Once those are in place: set a `MISTRAL_API_KEY` in `.env.local`, flip `AI_ENABLED` to `true`, and the feature returns. The model is `mistral-small-latest` via the Vercel AI SDK (`generateObject`); the editor bakes the model's keyframe scene into real frames client-side in `animate/ai.ts` (all values sanitized and clamped).

## Project structure

```
src/
  app/                    # Next.js app router pages + /api/animate (AI route)
  components/better/      # the component library (one file per component)
    animate/              # the Animate editor (modular: types, render, export, ai, presets, timeline, …)
  components/site/        # site chrome (dock, sidebar, gallery cards, theme)
  registry/index.tsx      # component registry: categories, demos, usage snippets
registry.json             # shadcn registry manifest (pnpm registry:build)
```

## Distributing the registry

Components ship as a **shadcn registry**, so anyone can pull them straight into their own project — no npm package to install, just the source.

- `registry.json` is the manifest (one entry per component, with its npm `dependencies`).
- `pnpm registry:build` runs `shadcn build`, which inlines each component's source into `public/r/<name>.json`. Deploy the site and those files are served at `https://<your-domain>/r/<name>.json`.
- `components.json` maps the `@bettercomp` namespace to that URL, so once deployed the install command is:

  ```bash
  npx shadcn@latest add @bettercomp/static-button
  ```

  (or the full URL, e.g. `npx shadcn@latest add https://components.bksh.site/r/static-button.json`).

Temporarily hidden components (above) are intentionally left out of `registry.json`, so they aren't published until you add them back.

**Package name** — `better-components` is already taken on npm ([v1.0.11](https://www.npmjs.com/package/better-components)); the registry and namespace use `bettercomp` / `@bettercomp` instead. The npm name is reserved by a thin placeholder published from `packages/bettercomp` ([bettercomp@0.0.1](https://www.npmjs.com/package/bettercomp)) — it exists only to hold the name and point at this registry. Shadcn registries are distributed as hosted JSON, not npm packages, so components are never installed from it.

## Scripts

- `pnpm dev` — dev server
- `pnpm build` — production build
- `pnpm lint` — ESLint (React compiler rules enabled)
- `pnpm registry:build` — build the shadcn registry into `public/r/`

## License

[MIT](./LICENSE) — free to use, copy, modify, and distribute the components in your own projects.
