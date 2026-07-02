"use client"

import { memo, useEffect, useState } from "react"

import type { Frame } from "./types"

// ── Phosphor icons, fetched on-the-fly from a CDN (all ~1500 icons, 0 bundle) ──
export const PHOSPHOR_SUGGEST = [
  "star",
  "heart",
  "play",
  "film-slate",
  "camera",
  "rocket",
  "lightning",
  "sparkle",
  "sun",
  "moon",
  "check-circle",
  "arrow-right",
  "music-notes",
  "fire",
  "crown",
  "trophy",
]

const phosphorRaw = new Map<string, string>() // name → raw svg text
const phosphorUrl = new Map<string, string>() // `${name}|${color}` → data URL
const phosphorFailed = new Set<string>() // names that 404'd — don't refetch

// Cache of loaded <img> elements (keyed by data URL) for canvas export.
export const imageCache = new Map<string, HTMLImageElement>()

export function getPhosphorUrl(name: string, color: string) {
  return phosphorUrl.get(`${name}|${color}`)
}

export async function phosphorDataUrl(
  name: string,
  color: string
): Promise<string> {
  const key = `${name}|${color}`
  const cached = phosphorUrl.get(key)
  if (cached) return cached
  if (phosphorFailed.has(name)) throw new Error("icon not found")
  let raw = phosphorRaw.get(name)
  if (!raw) {
    const res = await fetch(
      `https://cdn.jsdelivr.net/npm/@phosphor-icons/core@2/assets/regular/${name}.svg`
    )
    if (!res.ok) {
      phosphorFailed.add(name)
      throw new Error("icon not found")
    }
    raw = await res.text()
    phosphorRaw.set(name, raw)
  }
  // Force the requested color and drop fixed width/height.
  const colored = raw
    .replace(/<svg([^>]*)>/, `<svg$1 fill="${color}">`)
    .replace(/\s(width|height)="[^"]*"/g, "")
    .replace(/fill="#[0-9a-fA-F]+"/g, `fill="${color}"`)
  const url = `data:image/svg+xml;utf8,${encodeURIComponent(colored)}`
  phosphorUrl.set(key, url)
  return url
}

export const PhosphorIcon = memo(function PhosphorIcon({
  name,
  color,
  size,
}: {
  name: string
  color: string
  size: number
}) {
  const [url, setUrl] = useState<string | null>(
    phosphorUrl.get(`${name}|${color}`) ?? null
  )
  useEffect(() => {
    let alive = true
    phosphorDataUrl(name, color)
      .then((u) => alive && setUrl(u))
      .catch(() => alive && setUrl(null))
    return () => {
      alive = false
    }
  }, [name, color])
  if (!url) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} width={size} height={size} draggable={false} alt={name} />
  )
})

export function preloadImages(frames: Frame[]): Promise<void> {
  const srcs = new Set<string>()
  frames.forEach((f) =>
    f.shapes.forEach((s) => {
      if (s.type === "image" && s.src) srcs.add(s.src)
    })
  )
  return Promise.all(
    [...srcs].map(
      (src) =>
        new Promise<void>((res) => {
          if (imageCache.has(src)) return res()
          const img = new Image()
          img.onload = () => {
            imageCache.set(src, img)
            res()
          }
          img.onerror = () => res()
          img.src = src
        })
    )
  ).then(() => undefined)
}

export async function preloadIcons(frames: Frame[]): Promise<void> {
  const seen = new Set<string>()
  const jobs: Promise<void>[] = []
  frames.forEach((f) =>
    f.shapes.forEach((s) => {
      if (s.type !== "icon" || !s.iconName) return
      const key = `${s.iconName}|${s.fill}`
      if (seen.has(key)) return
      seen.add(key)
      jobs.push(
        phosphorDataUrl(s.iconName, s.fill)
          .then(
            (url) =>
              new Promise<void>((res) => {
                if (imageCache.has(url)) return res()
                const img = new Image()
                img.onload = () => {
                  imageCache.set(url, img)
                  res()
                }
                img.onerror = () => res()
                img.src = url
              })
          )
          .catch(() => undefined)
      )
    })
  )
  await Promise.all(jobs)
}
