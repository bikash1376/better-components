import { mistral } from "@ai-sdk/mistral"
import { generateObject } from "ai"
import { z } from "zod"

export const runtime = "nodejs"

// The model thinks like an animator: it describes OBJECTS with KEYFRAMES on a
// normalized 0→1 timeline. The client bakes these into real frames using the
// editor's fps, so "4 seconds" becomes 4 × fps frames — not 4 frames.
const keyframe = z.object({
  at: z.number().describe("normalized time 0 (start) to 1 (end)"),
  x: z.number().describe("left px on the 800-wide canvas"),
  y: z.number().describe("top px on the 450-tall canvas"),
  w: z.number().describe("width px"),
  h: z.number().describe("height px"),
  rotation: z.number().describe("degrees"),
  opacity: z.number().describe("0 (invisible) to 1 (solid)"),
  ease: z
    .enum(["linear", "in", "out", "inout"])
    .describe("easing INTO this keyframe"),
})

const object = z.object({
  type: z.enum([
    "square",
    "circle",
    "rectangle",
    "triangle",
    "oval",
    "star",
    "heart",
    "hexagon",
    "line",
    "arrow",
    "button",
    "icon",
    "text",
  ]),
  fill: z.string().describe("hex fill color, e.g. #ef4444"),
  stroke: z.string().describe("hex border color"),
  strokeWidth: z.number().describe("border thickness px, 0 for none"),
  radius: z.number().describe("corner radius px (rectangles/squares)"),
  texture: z
    .enum(["none", "smooth", "paper", "noise", "gradient", "dithering"])
    .describe("surface texture"),
  gradFrom: z.string().describe("gradient start hex (if texture=gradient)"),
  gradTo: z.string().describe("gradient end hex (if texture=gradient)"),
  gradAngle: z.number().describe("gradient angle degrees"),
  hand: z.boolean().describe("rough hand-drawn edges"),
  text: z.string().describe("label for text/button, else empty"),
  glyph: z.string().describe("single symbol for icon type, e.g. ★"),
  iconName: z
    .string()
    .describe(
      "Phosphor icon name in kebab-case for the icon type (e.g. rocket, film-slate, play, camera), else empty"
    ),
  fontSize: z.number().describe("font size px for text/button/icon"),
  fontFamily: z
    .enum([
      "Geist",
      "Inter",
      "Instrument Serif",
      "Playfair Display",
      "Pinyon Script",
    ])
    .describe("typeface for text/button"),
  blur: z
    .number()
    .describe("gaussian blur px, 0 for sharp. Use 10-30 for soft glows"),
  shadow: z.boolean().describe("soft drop shadow under the shape"),
  blendMode: z
    .enum([
      "normal",
      "multiply",
      "screen",
      "overlay",
      "darken",
      "lighten",
      "color-dodge",
      "difference",
      "exclusion",
    ])
    .describe("how the shape blends with what is behind it"),
  keyframes: z
    .array(keyframe)
    .describe("2-6 keyframes describing this object's motion over time"),
})

const scene = z.object({
  operation: z
    .enum(["replace", "append", "clear"])
    .describe(
      "replace = new animation, append = add after current, clear = delete everything"
    ),
  durationSeconds: z
    .number()
    .describe("intended length in seconds (the app converts to frames)"),
  objects: z.array(object).describe("all animated objects (empty if clearing)"),
})

const SYSTEM = `You are a world-class motion designer generating animations for a frame-by-frame editor.

CANVAS: EXACTLY 800px wide × 450px tall. Origin (0,0) top-left. Center is (400,225).
- Keep EVERY shape fully inside the canvas: 0 ≤ x and x+w ≤ 800, 0 ≤ y and y+h ≤ 450 — UNLESS it is intentionally sliding in/out of frame.
- Compose with the whole canvas. Use the center and rule-of-thirds. Do not cram things in the top-left.

TEXT — this is where most mistakes happen. Text is drawn CENTERED on the shape's box center (x+w/2, y+h/2). A string is roughly (0.55 × fontSize × characterCount) pixels wide. So:
- Pick fontSize so the text fits: width must be ≤ 760. For a title of N chars, fontSize ≈ 760 / (0.55 × N), capped at 72.
- Set w ≈ 0.55 × fontSize × N and h ≈ fontSize × 1.3.
- CENTER a title horizontally: x = (800 − w) / 2  (usually near x≈80–160), y around 150–200. Put a subtitle just below at y≈250 with a smaller fontSize (22–30).
- Titles: fontSize 40–72. Subtitles: 22–32. Captions: 14–20. Never let a title overflow the canvas.

TIMELINE: You do NOT output frames. You output OBJECTS with KEYFRAMES on a 0→1 timeline.
- "at" is normalized time: 0 = start, 0.5 = middle, 1 = end.
- Set durationSeconds from the user's request (e.g. "10 second animation" → durationSeconds: 10). The app multiplies by fps to create the real frames (10s × 24fps = 240 frames). NEVER equate seconds with a small frame count.
- Give each moving object 2-6 keyframes. The app smoothly interpolates between them.

SHAPES: square, circle, rectangle, triangle, oval, star, heart, hexagon, line (a thin bar), arrow (points right at rotation 0 — rotate for other directions), button, icon, text.

ICONS: for the icon type, set iconName to a real Phosphor icon in kebab-case (rocket, film-slate, play, camera, star, heart, lightning, sparkle, crown, trophy, sun, moon). The app loads it live. Size icons 32–96 and place them as accents, not overlapping text.

EFFECTS (use them like a motion designer):
- blur: 0 for crisp shapes. 10–30 turns a circle into a soft glow or bokeh. Blur + screen/overlay blendMode over a dark background = light bloom.
- shadow: true lifts cards, buttons and floating objects off the canvas.
- blendMode: screen/overlay for glows and light, multiply for tinting, normal otherwise.

EXAMPLE — a documentary intro (title "Jack and his sons", subtitle "The summer story of 2018"):
- Background: rectangle at x0 y0 w800 h450, dark gradient, opacity fades 0→1 over at 0→0.15.
- Title text "Jack and his sons": fontSize 60, w ≈ 0.55×60×17 ≈ 560, x=(800−560)/2=120, y=150, h=80, Playfair Display; slides up (y 180→150) and fades in over at 0.1→0.35.
- Subtitle "The summer story of 2018": fontSize 26, w ≈ 0.55×26×24 ≈ 340, x=(800−340)/2=230, y=250, h=40, Instrument Serif; fades in at 0.35→0.5.
- A small film-slate icon accent near the title, size 48, fading in later.
- Two blurred (blur 24, blendMode screen) warm circles drifting slowly behind the title for atmosphere.

ANIMATION PRINCIPLES (use them):
- Easing: use "out" for things arriving/settling, "in" for things leaving/accelerating, "inout" for smooth travel, "linear" only for constant motion (spinners).
- Bounce: alternate y keyframes high→low→high with "out"/"in" easing and slight squash (increase w, decrease h) at impact.
- Anticipation & overshoot: a tiny move opposite first, then past the target and settle back.
- Fade in/out with opacity. Stagger multiple objects by offsetting their keyframe times.
- Motion arcs, not straight lines, for organic movement.

STYLE & FILTERS (pick intentionally):
- gradient: depth, backgrounds, glossy shapes (set gradFrom/gradTo/gradAngle).
- noise / paper: organic, tactile, hand-made feel.
- hand:true: sketchy, doodle, playful looks.
- dithering: retro / pixel aesthetic.
- Compose scenes: a large background rectangle (often gradient) + foreground shapes, titles as text, accents as icons, blurred glow circles for atmosphere.

TYPOGRAPHY (choose fontFamily for text/button intentionally):
- Geist / Inter: modern UI, body copy, tech, clean labels and buttons.
- Playfair Display / Instrument Serif: elegant editorial headlines, luxury, titles — use a large fontSize (48-96) and center near the top or middle.
- Pinyon Script: fancy decorative signatures, wedding/quote accents — use sparingly and large.
- Place titles centered (x ≈ 400 minus half the width), give headings generous fontSize, keep captions smaller.

OPERATIONS:
- "replace": a brand new animation.
- "append": continue after the current animation.
- "clear": user wants to delete/reset everything — return operation "clear" and objects: [].

EDITING: If CURRENT_ANIMATION JSON is provided, the user is refining it. Return the FULL updated scene with operation "replace": keep every object, keyframe and style identical EXCEPT the specific change requested (e.g. "make the ball red" → change only that object's fill; "add 2 seconds" → increase durationSeconds and keep the motion; "make it bounce faster" → adjust timing). Use the CONVERSATION for context about what "it" refers to.

Keep it tasteful: 1-8 objects. Every object needs valid keyframes covering at:0 and at:1 (unless it enters/exits). Fill EVERY field on every object and keyframe.`

interface HistoryMessage {
  role: "user" | "assistant"
  text: string
}

export async function POST(req: Request) {
  if (!process.env.MISTRAL_API_KEY) {
    return Response.json(
      {
        error:
          "MISTRAL_API_KEY is not set. Add it to .env.local to enable AI generation.",
      },
      { status: 400 }
    )
  }

  try {
    const { prompt, fps, currentScene, history } = await req.json()
    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Missing prompt." }, { status: 400 })
    }

    const safeFps = Math.max(1, Math.min(60, Number(fps) || 24))

    const conversation = Array.isArray(history)
      ? (history as HistoryMessage[])
          .filter(
            (m) =>
              m &&
              (m.role === "user" || m.role === "assistant") &&
              typeof m.text === "string"
          )
          .slice(-8)
          .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
          .join("\n")
      : ""

    const context = [
      conversation ? `CONVERSATION SO FAR:\n${conversation}` : "",
      currentScene
        ? `CURRENT_ANIMATION (edit this):\n${JSON.stringify(currentScene)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n")

    const { object: result } = await generateObject({
      model: mistral("mistral-small-latest"),
      schema: scene,
      system: SYSTEM,
      prompt: `Frame rate is ${safeFps} fps. Request: ${prompt}${context ? `\n\n${context}` : ""}`,
      temperature: 0.6,
      maxRetries: 2,
    })

    // Clamp what the model controls loosely so the client never bakes junk.
    result.durationSeconds = Math.max(
      0.5,
      Math.min(30, result.durationSeconds || 2)
    )
    result.objects = (result.objects || []).slice(0, 12)

    return Response.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed."
    return Response.json({ error: message }, { status: 500 })
  }
}
