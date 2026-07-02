# Better Components

A library of animated, copy-paste React components — plus **Animate**, a browser-based motion design editor. Built with Next.js 16, React 19, Tailwind CSS 4, and [motion](https://motion.dev). Components are distributed shadcn-style: browse the gallery, copy the source (or the usage snippet), and paste it into your project.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). AI generation in the Animate editor needs a `MISTRAL_API_KEY` in `.env.local`.

## The site

- **Docs** (`/docs`) — installation guide (shadcn registry / `@bettercomp` namespace / manual copy) and how to use components.
- **Gallery** (`/components`) — components grouped by category, with static "posters" that only animate on hover (so the page stays smooth). Apps and UI are labelled as new.
- **Component pages** (`/components/<slug>`) — install command plus either a live **Playground** (interactive controls → live props → live, copyable code) for components that define one, or a static live demo. A code modal offers two tabs: **Auto** (a ready-to-paste usage example) and **Manual** (the full component source). All code is syntax-highlighted (`prism-react-renderer`, theme-adaptive via `--code-*` CSS variables).
- **Action dock** — the macOS-style dock in the corner: theme toggle, icon-library switcher, code view, search (Ctrl+K), GitHub link.
- Dark theme by default.

## Component categories

| Category | Components |
| --- | --- |
| **Apps** | Animate — the motion design editor (see below) |
| **UI** | Static Button (Apple-style pill), Dynamic Island (tap-to-expand iPhone pill), Infinite Canvas (windowed pannable icon grid), Paper (textured paper surface) |
| **Typography** | Text Shimmer, Number Ticker |
| **Stop Motion** | Stop Motion (jitter "boil"), Flipbook (choppy page snapping), Sketch Border (boiling hand-drawn border) |
| **Loaders** | Dots Loader, Bar Loader, Grid Pulse, Ring Spinner, Orbit Loader |
| **Carousel** | Marquee |
| **Mouse** | Magnetic Button, Magnetic Card (3D tilt), Icon Tooltip, Notification Card, Toast (Toaster + `toast()`) |

### Temporarily hidden

These are still in the codebase (source files intact, direct `/components/<slug>` URLs still resolve) but are excluded from the gallery, search, sidebar, and the published registry via a `hidden: true` flag in `src/registry/index.tsx`. Remove the flag to bring one back:

- **Typewriter Text** (Typography)
- **Shaders** — the whole category: Mesh Gradient, Neuro Noise, Metaballs
- **Icon Wheel** (Mouse)

## Animate — the motion design editor

A full frame-by-frame + keyframe motion editor that runs entirely in the browser (`src/components/better/animate/`):

- **Canvas**: fixed 800×450 artboard, 13 shape types (squares, circles, stars, hearts, hexagons, lines, arrows, buttons, icons, text, images…), drag/resize/rotate, textures (gradient, noise, paper, dithering), hand-drawn edges, ~1,500 Phosphor icons loaded on the fly.
- **Effects**: blur, drop shadow, blend modes, brightness/contrast/saturation/hue/grayscale, flip — rendered live and in exports.
- **Multi-track timeline**: layered tracks (like a layers panel — top row renders on top), each with its own frame sequence; shorter tracks hold their last frame. Two timeline views: **Frames** (canvas thumbnails per track) and **Time** (second ruler with a scrubbable playhead).
- **Editor ergonomics**: undo/redo, copy/paste/duplicate shapes, arrow-key nudging, zoom-to-cursor + pan, onion skinning, frame context menu (copy/paste/paste-to-next-10/duplicate/delete), canvas background + grid settings.
- **Templates**: one-click animation presets (Confetti, Ripple, Bounce, Pulse, Orbit) plus presets that recreate library components as editable frames (Text Shimmer, Dots Loader, Notification, Typewriter, Marquee).
- **AI chat**: describe an animation ("a red ball bouncing") and a Mistral model plans objects + keyframes which the editor bakes into frames at your fps; keep chatting to refine ("make it red", "add 2 seconds"). Conversation-aware, with retries and sanitized output.
- **Export**: HD 1920×1080 WebM, all tracks composited.

Keyboard shortcuts: `Space` play/pause · `[` `]` step frames · `Ctrl+Z/Y` undo/redo · `Ctrl+C/V/D` copy/paste/duplicate · arrows nudge (Shift = ×10) · `O` onion skin · `Del` delete · `Ctrl+scroll` zoom.

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

  (or the full URL, e.g. `npx shadcn@latest add https://bettercomp.dev/r/static-button.json`).

Temporarily hidden components (above) are intentionally left out of `registry.json`, so they aren't published until you add them back.

**Package name** — `better-components` is already taken on npm ([v1.0.11](https://www.npmjs.com/package/better-components)); `bettercomp` is free, so the registry and namespace use `bettercomp` / `@bettercomp`. Note that shadcn registries are distributed as hosted JSON, not as an npm package — you don't `npm publish` the components themselves. If you also want to reserve the name on npm, publish a thin placeholder/CLI package under `bettercomp`.

## Scripts

- `pnpm dev` — dev server
- `pnpm build` — production build
- `pnpm lint` — ESLint (React compiler rules enabled)
- `pnpm registry:build` — build the shadcn registry into `public/r/`
