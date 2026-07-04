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

// Offline/CSP fallback so the picker still shows something if the CDN list
// can't be fetched. Kept broad but conservative (all valid regular-weight names).
const PHOSPHOR_FALLBACK = [
  "star", "heart", "play", "pause", "stop", "film-slate", "camera", "video-camera",
  "rocket", "lightning", "sparkle", "sun", "moon", "cloud", "check-circle",
  "x-circle", "arrow-right", "arrow-left", "arrow-up", "arrow-down", "caret-right",
  "music-notes", "fire", "crown", "trophy", "gift", "bell", "chat-circle",
  "envelope", "phone", "user", "users", "house", "gear", "wrench",
  "magnifying-glass", "funnel", "tag", "bookmark", "flag", "map-pin", "globe",
  "compass", "clock", "calendar", "timer", "hourglass", "lightbulb", "brain",
  "eye", "eye-slash", "lock", "lock-open", "key", "shield", "shield-check",
  "trash", "pencil", "eraser", "paint-brush", "palette", "image", "images",
  "folder", "file", "download", "upload", "share", "link", "paperclip", "copy",
  "clipboard", "printer", "scissors", "ruler", "crop", "magic-wand", "cursor",
  "hand", "thumbs-up", "thumbs-down", "smiley", "megaphone", "microphone",
  "headphones", "wifi-high", "battery-full", "plug", "coffee", "pizza",
  "hamburger", "cake", "cookie", "car", "airplane", "boat", "bicycle", "train",
  "tree", "leaf", "flower", "plant", "mountains", "waves", "snowflake", "umbrella",
  "drop", "planet", "medal", "coin", "currency-dollar", "wallet", "credit-card",
  "bank", "shopping-cart", "shopping-bag", "storefront", "package", "truck",
  "confetti", "ghost", "robot", "skull", "bug", "butterfly", "bird", "cat", "dog",
  "fish", "paw-print", "basketball", "game-controller", "puzzle-piece", "guitar",
  "book", "book-open", "graduation-cap", "note", "notebook", "newspaper",
  "chart-bar", "chart-line", "chart-pie", "target", "hand-heart",
]

// Real, complete icon-name list pulled from jsdelivr's package file index.
let phosphorNames: string[] | null = null
let namesPromise: Promise<string[]> | null = null

/** All regular-weight Phosphor icon names (fetched once; falls back if offline). */
export function loadPhosphorNames(): Promise<string[]> {
  if (phosphorNames) return Promise.resolve(phosphorNames)
  if (namesPromise) return namesPromise
  const PREFIX = "/assets/regular/"
  namesPromise = fetch(
    "https://data.jsdelivr.com/v1/packages/npm/@phosphor-icons/core@2/flat"
  )
    .then((r) => (r.ok ? (r.json() as Promise<{ files?: { name: string }[] }>) : Promise.reject()))
    .then((data) => {
      const names = (data.files ?? [])
        .map((f) => f.name)
        .filter((n) => n.startsWith(PREFIX) && n.endsWith(".svg"))
        .map((n) => n.slice(PREFIX.length, -4))
        .sort()
      phosphorNames = names.length ? names : PHOSPHOR_FALLBACK
      return phosphorNames
    })
    .catch(() => {
      phosphorNames = PHOSPHOR_FALLBACK
      return PHOSPHOR_FALLBACK
    })
  return namesPromise
}

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
  // Recolor in place: Phosphor svgs carry `fill="currentColor"` on the <svg>
  // (plus occasional hex fills). Replace those with the requested colour —
  // appending a second fill attribute makes the XML invalid and the <img>
  // renders broken. Leave `fill="none"` (outline parts) untouched.
  const colored = raw
    .replace(/fill="currentColor"/g, `fill="${color}"`)
    .replace(/fill="#[0-9a-fA-F]+"/g, `fill="${color}"`)
    .replace(/\s(width|height)="[^"]*"/g, "")
  const url = `data:image/svg+xml,${encodeURIComponent(colored)}`
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
