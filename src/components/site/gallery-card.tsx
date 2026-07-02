"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"

interface GalleryCardProps {
  slug: string
  name: string
  description: string
  demo: ReactNode
  poster: ReactNode
}

/**
 * Gallery card that only mounts the animated demo while hovered — the resting
 * state renders a static poster, so no animation loops run until you hover.
 */
export function GalleryCard({
  slug,
  name,
  description,
  demo,
  poster,
}: GalleryCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={`/components/${slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex flex-col overflow-hidden rounded-xl border border-border transition-colors hover:border-foreground/30"
    >
      <div className="flex h-40 items-center justify-center overflow-hidden bg-muted/30 p-4">
        {hovered ? demo : poster}
      </div>
      <div className="border-t border-border p-4">
        <h3 className="font-medium">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}
