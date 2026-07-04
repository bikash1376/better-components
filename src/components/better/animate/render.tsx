"use client"

import { memo } from "react"

import { cn } from "@/lib/utils"

import { PhosphorIcon } from "./icons"
import {
  type Corner,
  type Shape,
  domFilter,
  heartSvgPath,
  hexagonPoints,
  noiseUri,
  pointsToPath,
  shapeTransform,
  starPoints,
} from "./types"

function shapeStyle(s: Shape): React.CSSProperties {
  const fill = s.transparentFill ? "transparent" : s.fill
  const style: React.CSSProperties = {
    backgroundColor: fill,
    backgroundImage: undefined,
    backgroundSize: undefined,
    backgroundBlendMode: undefined,
    border: s.strokeWidth ? `${s.strokeWidth}px solid ${s.stroke}` : undefined,
  }
  if (!s.transparentFill) {
    if (s.texture === "gradient") {
      style.backgroundImage = `linear-gradient(${s.gradAngle}deg, ${s.gradFrom}, ${s.gradTo})`
    } else if (s.texture === "noise" || s.texture === "paper") {
      style.backgroundImage = `${noiseUri(s.noiseFreq, s.noiseOpacity)}, linear-gradient(${fill}, ${fill})`
      style.backgroundBlendMode = s.texture === "paper" ? "multiply" : "overlay"
    } else if (s.texture === "dithering") {
      style.backgroundImage = `radial-gradient(${s.ditherColor} 30%, transparent 32%), linear-gradient(${fill}, ${fill})`
      style.backgroundSize = `${s.ditherSize}px ${s.ditherSize}px, 100% 100%`
    }
  }
  return style
}

const SVG_TYPES = new Set(["triangle", "star", "heart", "hexagon", "arrow"])

function svgBody(s: Shape) {
  const fill = s.transparentFill ? "transparent" : s.fill
  const stroke = s.strokeWidth ? s.stroke : "none"
  const gradId = `grad-${s.id}`
  const useGrad = !s.transparentFill && s.texture === "gradient"
  const paint = useGrad ? `url(#${gradId})` : fill
  const grad = useGrad ? (
    <defs>
      <linearGradient
        id={gradId}
        gradientTransform={`rotate(${s.gradAngle - 90} 0.5 0.5)`}
      >
        <stop offset="0" stopColor={s.gradFrom} />
        <stop offset="1" stopColor={s.gradTo} />
      </linearGradient>
    </defs>
  ) : null

  if (s.type === "triangle")
    return (
      <>
        {grad}
        <polygon
          points={`${s.w / 2},0 ${s.w},${s.h} 0,${s.h}`}
          fill={paint}
          stroke={stroke}
          strokeWidth={s.strokeWidth}
        />
      </>
    )
  if (s.type === "star")
    return (
      <>
        {grad}
        <polygon
          points={starPoints(s.w, s.h)
            .map((p) => p.join(","))
            .join(" ")}
          fill={paint}
          stroke={stroke}
          strokeWidth={s.strokeWidth}
          strokeLinejoin="round"
        />
      </>
    )
  if (s.type === "hexagon")
    return (
      <>
        {grad}
        <polygon
          points={hexagonPoints(s.w, s.h)
            .map((p) => p.join(","))
            .join(" ")}
          fill={paint}
          stroke={stroke}
          strokeWidth={s.strokeWidth}
          strokeLinejoin="round"
        />
      </>
    )
  if (s.type === "heart")
    return (
      <>
        {grad}
        <path
          d={heartSvgPath(s.w, s.h)}
          fill={paint}
          stroke={stroke}
          strokeWidth={s.strokeWidth}
          strokeLinejoin="round"
        />
      </>
    )
  // arrow: shaft + head drawn with the fill color; strokeWidth = thickness
  const t = Math.max(2, s.strokeWidth || 5)
  const head = Math.min(s.w * 0.35, s.h)
  const mid = s.h / 2
  return (
    <>
      {grad}
      <line
        x1={0}
        y1={mid}
        x2={Math.max(1, s.w - head * 0.8)}
        y2={mid}
        stroke={useGrad ? paint : s.fill}
        strokeWidth={t}
        strokeLinecap="round"
      />
      <polygon
        points={`${s.w},${mid} ${s.w - head},${Math.max(0, mid - head / 2)} ${s.w - head},${Math.min(s.h, mid + head / 2)}`}
        fill={useGrad ? paint : s.fill}
      />
    </>
  )
}

export const ShapeView = memo(function ShapeView({
  shape: s,
  ghost,
  onSelect,
}: {
  shape: Shape
  /** Render as a non-interactive onion-skin ghost. */
  ghost?: boolean
  onSelect?: (id: string, e: React.PointerEvent) => void
}) {
  const box: React.CSSProperties = {
    position: "absolute",
    left: s.x,
    top: s.y,
    width: Math.max(1, s.w),
    height: Math.max(1, s.h),
    opacity: ghost ? s.opacity * 0.25 : s.opacity,
    transform: shapeTransform(s),
    // SVG elements default CSS transform-origin to 0 0 (user space), so without
    // this they'd rotate/flip around the top-left instead of their centre. Pin
    // every shape's pivot to its own box centre.
    transformOrigin: "center",
    transformBox: "border-box",
    filter: domFilter(s),
    mixBlendMode: s.blendMode !== "normal" ? s.blendMode : undefined,
    pointerEvents: ghost ? "none" : undefined,
  }
  const handleDown = onSelect
    ? (e: React.PointerEvent) => onSelect(s.id, e)
    : undefined

  if (s.type === "draw") {
    return (
      <svg
        style={{ ...box, overflow: "visible" }}
        viewBox={`0 0 ${Math.max(1, s.w)} ${Math.max(1, s.h)}`}
        onPointerDown={handleDown}
        className={ghost ? undefined : "cursor-move"}
      >
        <title>drawing</title>
        <path
          d={pointsToPath(s.points)}
          fill="none"
          stroke={s.fill}
          strokeWidth={Math.max(1, s.strokeWidth || 3)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (SVG_TYPES.has(s.type)) {
    return (
      <svg
        style={{ ...box, overflow: "visible" }}
        viewBox={`0 0 ${Math.max(1, s.w)} ${Math.max(1, s.h)}`}
        onPointerDown={handleDown}
        className={ghost ? undefined : "cursor-move"}
      >
        <title>{s.type}</title>
        {svgBody(s)}
      </svg>
    )
  }

  if (s.type === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={s.src}
        alt="uploaded"
        draggable={false}
        onPointerDown={handleDown}
        title="image"
        style={{
          ...box,
          borderRadius: `${s.radius}px`,
          objectFit: "cover",
          border: s.strokeWidth
            ? `${s.strokeWidth}px solid ${s.stroke}`
            : undefined,
        }}
        className={ghost ? undefined : "cursor-move"}
      />
    )
  }

  const radius =
    s.type === "circle" || s.type === "oval" ? "50%" : `${s.radius}px`
  // Text and icons center on the box and may overflow it, so they never clip.
  const noClip = s.type === "text" || s.type === "icon"

  return (
    <div
      onPointerDown={handleDown}
      title={s.type}
      style={{ ...box, ...shapeStyle(s), borderRadius: radius }}
      className={cn(
        "flex items-center justify-center",
        !ghost && "cursor-move",
        noClip ? "overflow-visible" : "overflow-hidden"
      )}
    >
      {s.type === "icon" ? (
        s.iconName ? (
          <PhosphorIcon
            name={s.iconName}
            color={s.fill}
            size={Math.min(s.w, s.h)}
          />
        ) : (
          <span
            style={{ color: s.fill, fontSize: s.fontSize }}
            className="leading-none"
          >
            {s.glyph}
          </span>
        )
      ) : s.type === "text" || s.type === "button" ? (
        <span
          style={{
            color: s.type === "button" ? "#fff" : s.fill,
            fontSize: s.fontSize,
            fontFamily: s.fontFamily,
          }}
          className="whitespace-nowrap px-2 text-center font-medium leading-tight"
        >
          {s.text}
        </span>
      ) : null}
    </div>
  )
})

export function SelectionBox({
  shape: s,
  onResizeStart,
}: {
  shape: Shape
  onResizeStart: (corner: Corner, e: React.PointerEvent) => void
}) {
  const corners: { corner: Corner; pos: string; cursor: string }[] = [
    { corner: "nw", pos: "-left-1 -top-1", cursor: "cursor-nwse-resize" },
    { corner: "ne", pos: "-right-1 -top-1", cursor: "cursor-nesw-resize" },
    { corner: "sw", pos: "-bottom-1 -left-1", cursor: "cursor-nesw-resize" },
    { corner: "se", pos: "-bottom-1 -right-1", cursor: "cursor-nwse-resize" },
  ]
  return (
    <div
      className="pointer-events-none absolute z-20 outline outline-2 outline-offset-2 outline-blue-500"
      style={{
        left: s.x,
        top: s.y,
        width: s.w,
        height: s.h,
        transform: s.rotation ? `rotate(${s.rotation}deg)` : undefined,
      }}
    >
      {corners.map(({ corner, pos, cursor }) => (
        <div
          key={corner}
          onPointerDown={(e) => {
            e.stopPropagation()
            onResizeStart(corner, e)
          }}
          className={cn(
            "pointer-events-auto absolute size-2.5 rounded-full border-2 border-blue-500 bg-background",
            pos,
            cursor
          )}
        />
      ))}
    </div>
  )
}
