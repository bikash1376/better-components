"use client"

import { useState } from "react"
import {
  ChevronDown,
  FlipHorizontal2,
  FlipVertical2,
  RotateCcw,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { PHOSPHOR_SUGGEST } from "./icons"
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
    <div className="mb-2 rounded-lg border border-border/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
      >
        {title}
        <ChevronDown
          className={cn("size-3.5 transition-transform", !open && "-rotate-90")}
        />
      </button>
      {open && <div className="px-2.5 pb-2.5">{children}</div>}
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  min,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => {
          const v = +e.target.value
          if (Number.isFinite(v)) onChange(min !== undefined ? Math.max(min, v) : v)
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
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full cursor-pointer"
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
            <FlipHorizontal2 className="size-3.5" />
          </button>
          <button
            onClick={() => onChange({ flipY: !s.flipY })}
            className={cn(
              "cursor-pointer rounded border border-border p-1 hover:bg-muted",
              s.flipY && "bg-muted"
            )}
            title="Flip vertical"
          >
            <FlipVertical2 className="size-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="cursor-pointer rounded border border-border p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
            title="Delete shape (Del)"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      <Section title="Transform">
        <div className="mb-2 grid grid-cols-2 gap-2">
          <NumberField label="X" value={s.x} onChange={(x) => onChange({ x })} />
          <NumberField label="Y" value={s.y} onChange={(y) => onChange({ y })} />
          <NumberField
            label="Width"
            value={s.w}
            min={1}
            onChange={(w) => onChange({ w })}
          />
          <NumberField
            label="Height"
            value={s.h}
            min={1}
            onChange={(h) => onChange({ h })}
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
            <input
              type="range"
              min={0}
              max={12}
              value={s.strokeWidth}
              onChange={(e) => onChange({ strokeWidth: +e.target.value })}
              className="flex-1 cursor-pointer"
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
            <input
              type="checkbox"
              checked={s.hand}
              onChange={(e) => onChange({ hand: e.target.checked })}
              className="size-4 cursor-pointer accent-foreground"
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
                <select
                  value={s.fontFamily}
                  onChange={(e) => onChange({ fontFamily: e.target.value })}
                  className={cn(FIELD, "cursor-pointer")}
                >
                  {FONTS.map((f) => (
                    <option key={f.label} value={f.css} style={{ fontFamily: f.css }}>
                      {f.label}
                    </option>
                  ))}
                </select>
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
              <Row label="Phosphor icon (any of ~1500, loaded on the fly)">
                <input
                  value={s.iconName}
                  onChange={(e) =>
                    onChange({ iconName: e.target.value.trim().toLowerCase() })
                  }
                  placeholder="e.g. rocket, film-slate, heart"
                  className={FIELD}
                />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {PHOSPHOR_SUGGEST.slice(0, 10).map((n) => (
                    <button
                      key={n}
                      onClick={() => onChange({ iconName: n })}
                      className={cn(
                        "cursor-pointer rounded border px-1.5 py-0.5 text-[10px]",
                        s.iconName === n
                          ? "border-foreground bg-muted"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </Row>
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
              <input
                type="range"
                min={0}
                max={360}
                value={s.gradAngle}
                onChange={(e) => onChange({ gradAngle: +e.target.value })}
                className="flex-1 cursor-pointer"
                title="Gradient angle"
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
            <RotateCcw className="size-3" /> Reset
          </button>
        </div>
        <select
          value={s.blendMode}
          onChange={(e) => onChange({ blendMode: e.target.value as BlendMode })}
          className={cn(FIELD, "mb-3 cursor-pointer capitalize")}
        >
          {BLEND_MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

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
          <input
            type="checkbox"
            checked={s.shadow}
            onChange={(e) => onChange({ shadow: e.target.checked })}
            className="size-4 cursor-pointer accent-foreground"
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
          <input
            type="checkbox"
            checked={grid}
            onChange={(e) => onGrid(e.target.checked)}
            className="size-4 cursor-pointer accent-foreground"
          />
        </label>
        <label className="mb-1 flex cursor-pointer items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">
            Onion skin (O)
          </span>
          <input
            type="checkbox"
            checked={onion}
            onChange={(e) => onOnion(e.target.checked)}
            className="size-4 cursor-pointer accent-foreground"
          />
        </label>
      </Section>
      <Section title="Shortcuts" defaultOpen={false}>
        <ul className="space-y-1 text-[11px] text-muted-foreground">
          <li>⌫ / Del — delete shape</li>
          <li>Ctrl+Z / Ctrl+Shift+Z — undo / redo</li>
          <li>Ctrl+C / V / D — copy / paste / duplicate</li>
          <li>Arrows — nudge (Shift = ×10)</li>
          <li>Space — play / pause</li>
          <li>[ and ] — previous / next frame</li>
          <li>O — onion skin · Esc — deselect</li>
          <li>Ctrl+scroll — zoom · scroll — pan</li>
        </ul>
      </Section>
    </div>
  )
}
