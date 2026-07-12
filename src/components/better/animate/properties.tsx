"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  CaretDownIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  ArrowCounterClockwiseIcon,
  TrashIcon,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider as UiSlider } from "@/components/ui/slider"

import { PhosphorIcon, loadPhosphorNames } from "./icons"
import { TEXT_ANIMS } from "./text-anims"
import {
  type BlendMode,
  type Shape,
  BLEND_MODES,
  FONTS,
  GLYPHS,
  TEXTURES,
} from "./types"

const COLOR_INPUT =
  "size-8 shrink-0 cursor-pointer overflow-hidden rounded-full border border-border p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0"

const FIELD =
  "w-full rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:border-foreground/40"

export function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
      >
        {title}
        <CaretDownIcon
          className={cn(
            "size-3 opacity-60 transition-transform",
            !open && "-rotate-90"
          )}
        />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  )
}

/**
 * Compact numeric control: type a value, scroll the wheel over it, or drag the
 * label left/right to scrub (Figma-style). `step` scales drag/wheel sensitivity.
 */
function NumberField({
  label,
  value,
  onChange,
  min,
  step = 1,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  step?: number
}) {
  const drag = useRef<{ x: number; v: number } | null>(null)
  const clamp = (v: number) => (min !== undefined ? Math.max(min, v) : v)

  return (
    <label className="block">
      <span
        onPointerDown={(e) => {
          e.preventDefault()
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
          drag.current = { x: e.clientX, v: value }
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          const dv = (e.clientX - drag.current.x) * step
          onChange(clamp(Math.round(drag.current.v + dv)))
        }}
        onPointerUp={(e) => {
          ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
          drag.current = null
        }}
        title="Drag to scrub"
        className="mb-1 flex w-fit cursor-ew-resize select-none items-center gap-1 text-[11px] font-medium text-muted-foreground"
      >
        <span className="text-foreground/30">⟺</span>
        {label}
      </span>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => {
          const v = +e.target.value
          if (Number.isFinite(v)) onChange(clamp(v))
        }}
        onWheel={(e) => {
          // Only when focused, so scrolling the panel doesn't hijack values.
          if (document.activeElement !== e.currentTarget) return
          e.stopPropagation()
          onChange(clamp(Math.round(value + (e.deltaY < 0 ? step : -step))))
        }}
        className={FIELD}
      />
    </label>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <Row label={label}>
      <UiSlider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </Row>
  )
}

export function Properties({
  shape: s,
  onChange,
  onDelete,
  onReorder,
  onTextAnim,
}: {
  shape: Shape
  onChange: (patch: Partial<Shape>) => void
  onDelete: () => void
  onReorder: (dir: "front" | "back") => void
  /** Apply a prebuilt text animation (only shown for text/button shapes). */
  onTextAnim?: (animId: string) => void
}) {
  const isText = s.type === "text" || s.type === "button"
  const hasFx =
    s.blur > 0 ||
    s.shadow ||
    s.blendMode !== "normal" ||
    s.brightness !== 1 ||
    s.contrast !== 1 ||
    s.saturate !== 1 ||
    s.hueRotate !== 0 ||
    s.grayscale > 0

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold capitalize">{s.type}</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onChange({ flipX: !s.flipX })}
            className={cn(
              "cursor-pointer rounded border border-border p-1 hover:bg-muted",
              s.flipX && "bg-muted"
            )}
            title="Flip horizontal"
          >
            <FlipHorizontalIcon className="size-3.5" />
          </button>
          <button
            onClick={() => onChange({ flipY: !s.flipY })}
            className={cn(
              "cursor-pointer rounded border border-border p-1 hover:bg-muted",
              s.flipY && "bg-muted"
            )}
            title="Flip vertical"
          >
            <FlipVerticalIcon className="size-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="cursor-pointer rounded border border-border p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
            title="Delete shape (Del)"
          >
            <TrashIcon className="size-3.5" />
          </button>
        </div>
      </div>

      <Section title="Transform">
        <div className="mb-2 grid grid-cols-2 gap-2">
          <NumberField label="X" value={s.x} onChange={(x) => onChange({ x })} />
          <NumberField label="Y" value={s.y} onChange={(y) => onChange({ y })} />
          {/* Resizing from the panel grows symmetrically about the centre
              (adjust x/y by half the delta) instead of drifting off a corner. */}
          <NumberField
            label="Width"
            value={s.w}
            min={1}
            onChange={(w) => onChange({ w, x: s.x + (s.w - w) / 2 })}
          />
          <NumberField
            label="Height"
            value={s.h}
            min={1}
            onChange={(h) => onChange({ h, y: s.y + (s.h - h) / 2 })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Slider
            label={`Rotation ${Math.round(s.rotation)}°`}
            value={s.rotation}
            min={0}
            max={360}
            onChange={(rotation) => onChange({ rotation })}
          />
          <Slider
            label={`Opacity ${Math.round(s.opacity * 100)}%`}
            value={s.opacity}
            min={0}
            max={1}
            step={0.05}
            onChange={(opacity) => onChange({ opacity })}
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onReorder("front")}
            className="cursor-pointer rounded border border-border px-2 py-1 text-[11px] hover:bg-muted"
          >
            Bring to front
          </button>
          <button
            onClick={() => onReorder("back")}
            className="cursor-pointer rounded border border-border px-2 py-1 text-[11px] hover:bg-muted"
          >
            Send to back
          </button>
        </div>
      </Section>

      <Section title="Appearance">
        {s.type !== "image" && (
          <Row label="Fill">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={s.fill}
                onChange={(e) => onChange({ fill: e.target.value })}
                className={COLOR_INPUT}
              />
              <button
                onClick={() => onChange({ transparentFill: !s.transparentFill })}
                className={cn(
                  "cursor-pointer rounded border border-border px-2 py-1 text-[11px]",
                  s.transparentFill ? "bg-muted" : "text-muted-foreground"
                )}
              >
                Transparent
              </button>
            </div>
          </Row>
        )}

        <Row label="Border color & width">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={s.stroke}
              onChange={(e) => onChange({ stroke: e.target.value })}
              className={COLOR_INPUT}
            />
            <UiSlider
              min={0}
              max={12}
              value={[s.strokeWidth]}
              onValueChange={([v]) => onChange({ strokeWidth: v })}
              className="flex-1"
            />
            <button
              onClick={() => onChange({ strokeWidth: 0 })}
              className="cursor-pointer rounded border border-border px-1.5 py-1 text-[10px] text-muted-foreground"
            >
              none
            </button>
          </div>
        </Row>

        {(s.type === "square" ||
          s.type === "rectangle" ||
          s.type === "button" ||
          s.type === "line" ||
          s.type === "image") && (
          <Slider
            label={`Corner radius ${s.radius}`}
            value={s.radius}
            min={0}
            max={80}
            onChange={(radius) => onChange({ radius })}
          />
        )}

        {s.type !== "image" && (
          <label className="mb-1 flex cursor-pointer items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              Hand-drawn edges
            </span>
            <Checkbox
              checked={s.hand}
              onCheckedChange={(v) => onChange({ hand: v === true })}
            />
          </label>
        )}
      </Section>

      {(isText || s.type === "icon") && (
        <Section title={s.type === "icon" ? "Icon" : "Text"}>
          {isText && (
            <>
              <Row label="Value">
                <input
                  value={s.text}
                  onChange={(e) => onChange({ text: e.target.value })}
                  className={FIELD}
                />
              </Row>
              <Row label="Font">
                <Select
                  value={s.fontFamily}
                  onValueChange={(fontFamily) => onChange({ fontFamily })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map((f) => (
                      <SelectItem
                        key={f.label}
                        value={f.css}
                        style={{ fontFamily: f.css }}
                      >
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Row>
            </>
          )}
          <Slider
            label={`Text size ${s.fontSize}`}
            value={s.fontSize}
            min={8}
            max={120}
            onChange={(fontSize) => onChange({ fontSize })}
          />
          {s.type === "icon" && (
            <>
              <IconPicker
                value={s.iconName}
                onPick={(iconName) => onChange({ iconName })}
              />
              <Row label="…or a simple glyph">
                <div className="flex flex-wrap gap-1">
                  {GLYPHS.map((g) => (
                    <button
                      key={g}
                      onClick={() => onChange({ glyph: g, iconName: "" })}
                      className={cn(
                        "grid size-7 cursor-pointer place-items-center rounded border text-sm",
                        !s.iconName && s.glyph === g
                          ? "border-foreground bg-muted"
                          : "border-border"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </Row>
            </>
          )}
        </Section>
      )}

      {isText && onTextAnim && (
        <Section title="Animate">
          <p className="mb-2 text-[10px] text-muted-foreground">
            Move to a later frame (e.g. ~2s), then apply — it animates from where
            the text appears to here.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {TEXT_ANIMS.map((a) => (
              <button
                key={a.id}
                onClick={() => onTextAnim(a.id)}
                title={a.hint}
                className="cursor-pointer rounded-md border border-border px-2 py-1.5 text-[11px] font-medium hover:border-foreground/40 hover:bg-muted"
              >
                {a.label}
              </button>
            ))}
          </div>
        </Section>
      )}

      {s.type !== "image" && (
        <Section title="Texture">
          <div className="grid grid-cols-3 gap-1">
            {TEXTURES.map((tex) => (
              <button
                key={tex}
                onClick={() => onChange({ texture: tex })}
                className={cn(
                  "cursor-pointer rounded border px-1 py-1 text-[10px] capitalize",
                  s.texture === tex
                    ? "border-foreground bg-muted"
                    : "border-border text-muted-foreground"
                )}
              >
                {tex}
              </button>
            ))}
          </div>

          {s.texture === "gradient" && !s.transparentFill && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="color"
                value={s.gradFrom}
                onChange={(e) => onChange({ gradFrom: e.target.value })}
                className={COLOR_INPUT}
              />
              <input
                type="color"
                value={s.gradTo}
                onChange={(e) => onChange({ gradTo: e.target.value })}
                className={COLOR_INPUT}
              />
              <UiSlider
                min={0}
                max={360}
                value={[s.gradAngle]}
                onValueChange={([v]) => onChange({ gradAngle: v })}
                className="flex-1"
              />
            </div>
          )}

          {(s.texture === "noise" || s.texture === "paper") &&
            !s.transparentFill && (
              <div className="mt-2">
                <Slider
                  label={`Scale ${s.noiseFreq.toFixed(2)}`}
                  value={s.noiseFreq}
                  min={0.2}
                  max={2}
                  step={0.05}
                  onChange={(noiseFreq) => onChange({ noiseFreq })}
                />
                <Slider
                  label={`Intensity ${Math.round(s.noiseOpacity * 100)}%`}
                  value={s.noiseOpacity}
                  min={0}
                  max={1}
                  step={0.02}
                  onChange={(noiseOpacity) => onChange({ noiseOpacity })}
                />
              </div>
            )}

          {s.texture === "dithering" && !s.transparentFill && (
            <div className="mt-2">
              <Slider
                label={`Dot spacing ${s.ditherSize}px`}
                value={s.ditherSize}
                min={2}
                max={16}
                onChange={(ditherSize) => onChange({ ditherSize })}
              />
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={s.ditherColor}
                  onChange={(e) => onChange({ ditherColor: e.target.value })}
                  className={COLOR_INPUT}
                />
                <span className="text-[11px] text-muted-foreground">
                  Dot color
                </span>
              </div>
            </div>
          )}
        </Section>
      )}

      <Section title="Effects" defaultOpen={hasFx}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">
            Blend mode
          </span>
          <button
            onClick={() =>
              onChange({
                blur: 0,
                shadow: false,
                blendMode: "normal",
                brightness: 1,
                contrast: 1,
                saturate: 1,
                hueRotate: 0,
                grayscale: 0,
              })
            }
            className="inline-flex cursor-pointer items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
            title="Reset all effects"
          >
            <ArrowCounterClockwiseIcon className="size-3" /> Reset
          </button>
        </div>
        <Select
          value={s.blendMode}
          onValueChange={(v) => onChange({ blendMode: v as BlendMode })}
        >
          <SelectTrigger className="mb-3 capitalize">
            <SelectValue placeholder="Blend mode" />
          </SelectTrigger>
          <SelectContent>
            {BLEND_MODES.map((m) => (
              <SelectItem key={m} value={m} className="capitalize">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Slider
          label={`Blur ${s.blur}px`}
          value={s.blur}
          min={0}
          max={40}
          onChange={(blur) => onChange({ blur })}
        />

        <label className="mb-2 flex cursor-pointer items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">
            Drop shadow
          </span>
          <Checkbox
            checked={s.shadow}
            onCheckedChange={(v) => onChange({ shadow: v === true })}
          />
        </label>
        {s.shadow && (
          <div className="mb-2 rounded-md border border-border p-2">
            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Offset X"
                value={s.shadowX}
                onChange={(shadowX) => onChange({ shadowX })}
              />
              <NumberField
                label="Offset Y"
                value={s.shadowY}
                onChange={(shadowY) => onChange({ shadowY })}
              />
            </div>
            <Slider
              label={`Softness ${s.shadowBlur}px`}
              value={s.shadowBlur}
              min={0}
              max={60}
              onChange={(shadowBlur) => onChange({ shadowBlur })}
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={s.shadowColor.slice(0, 7)}
                onChange={(e) => onChange({ shadowColor: `${e.target.value}66` })}
                className={COLOR_INPUT}
              />
              <span className="text-[11px] text-muted-foreground">
                Shadow color
              </span>
            </div>
          </div>
        )}

        <Slider
          label={`Brightness ${Math.round(s.brightness * 100)}%`}
          value={s.brightness}
          min={0.2}
          max={2}
          step={0.05}
          onChange={(brightness) => onChange({ brightness })}
        />
        <Slider
          label={`Contrast ${Math.round(s.contrast * 100)}%`}
          value={s.contrast}
          min={0.2}
          max={2}
          step={0.05}
          onChange={(contrast) => onChange({ contrast })}
        />
        <Slider
          label={`Saturation ${Math.round(s.saturate * 100)}%`}
          value={s.saturate}
          min={0}
          max={2}
          step={0.05}
          onChange={(saturate) => onChange({ saturate })}
        />
        <Slider
          label={`Hue rotate ${s.hueRotate}°`}
          value={s.hueRotate}
          min={0}
          max={360}
          onChange={(hueRotate) => onChange({ hueRotate })}
        />
        <Slider
          label={`Grayscale ${Math.round(s.grayscale * 100)}%`}
          value={s.grayscale}
          min={0}
          max={1}
          step={0.05}
          onChange={(grayscale) => onChange({ grayscale })}
        />
      </Section>
    </div>
  )
}

/** Searchable Phosphor icon picker with live rendered previews. */
function IconPicker({
  value,
  onPick,
}: {
  value: string
  onPick: (name: string) => void
}) {
  const [q, setQ] = useState("")
  const [names, setNames] = useState<string[]>([])

  useEffect(() => {
    let alive = true
    loadPhosphorNames().then((n) => {
      if (alive) setNames(n)
    })
    return () => {
      alive = false
    }
  }, [])

  const query = q.trim().toLowerCase()
  const results = useMemo(() => {
    if (!names.length) return []
    if (!query) return names.slice(0, 48)
    const starts: string[] = []
    const contains: string[] = []
    for (const n of names) {
      if (n.startsWith(query)) starts.push(n)
      else if (n.includes(query)) contains.push(n)
      if (starts.length >= 60) break
    }
    return [...starts, ...contains].slice(0, 60)
  }, [names, query])

  return (
    <Row label="Icon">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search 1,500+ icons…"
        className={FIELD}
      />
      {value && (
        <p className="mt-1 truncate text-[10px] text-muted-foreground">
          Selected: <span className="text-foreground">{value}</span>
        </p>
      )}
      <div className="mt-1.5 grid max-h-40 grid-cols-6 gap-1 overflow-y-auto rounded-md border border-border/60 p-1.5">
        {results.map((n) => (
          <button
            key={n}
            onClick={() => onPick(n)}
            title={n}
            className={cn(
              "flex aspect-square cursor-pointer items-center justify-center rounded border",
              value === n
                ? "border-foreground bg-muted"
                : "border-transparent hover:bg-muted"
            )}
          >
            <PhosphorIcon name={n} color="#8b8b8b" size={18} />
          </button>
        ))}
        {!results.length && (
          <p className="col-span-6 px-1 py-3 text-center text-[10px] text-muted-foreground">
            {names.length ? "No icons match." : "Loading icons…"}
          </p>
        )}
      </div>
    </Row>
  )
}

/** Shown when nothing is selected — canvas/document settings. */
export function CanvasProperties({
  bg,
  onBg,
  grid,
  onGrid,
  onion,
  onOnion,
}: {
  bg: string
  onBg: (v: string) => void
  grid: boolean
  onGrid: (v: boolean) => void
  onion: boolean
  onOnion: (v: boolean) => void
}) {
  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        Select a shape to edit it. Change a property on another frame to
        animate it.
      </p>
      <Section title="Canvas">
        <Row label="Background">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bg === "transparent" ? "#ffffff" : bg}
              onChange={(e) => onBg(e.target.value)}
              className={COLOR_INPUT}
            />
            {["#ffffff", "#0f172a", "#fef3c7"].map((c) => (
              <button
                key={c}
                onClick={() => onBg(c)}
                style={{ backgroundColor: c }}
                className={cn(
                  "size-6 cursor-pointer rounded-full border",
                  bg === c ? "border-foreground" : "border-border"
                )}
                title={c}
              />
            ))}
          </div>
        </Row>
        <label className="mb-2 flex cursor-pointer items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">
            Dot grid
          </span>
          <Checkbox
            checked={grid}
            onCheckedChange={(v) => onGrid(v === true)}
          />
        </label>
        <label className="mb-1 flex cursor-pointer items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">
            Onion skin (O)
          </span>
          <Checkbox
            checked={onion}
            onCheckedChange={(v) => onOnion(v === true)}
          />
        </label>
      </Section>
    </div>
  )
}
