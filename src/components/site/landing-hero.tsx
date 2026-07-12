"use client"

import Link from "next/link"
import { GrainGradient } from "@paper-design/shaders-react"

import { Button } from "@/components/ui/button"
import { InstallCommand } from "@/components/site/install-command"
import { installCommand } from "@/lib/registry"

/**
 * Landing hero — an animated grain-gradient shader (paper.design) behind the
 * title. Static layout: no scroll container, no zoom, nothing that reacts to
 * the wheel.
 */
export function LandingHero() {
  return (
    <div className="relative min-h-svh w-full bg-black">
      {/* Animated backdrop. `speed` drives it — set 0 to freeze. It paints to a
          canvas, so it sits under the content and ignores pointer events. */}
      <GrainGradient
        colors={["#7300ff", "#eba8ff", "#00bfff", "#2a00ff"]}
        colorBack="#000000"
        softness={0.8}
        intensity={0.35}
        noise={0.3}
        shape="corners"
        speed={0.6}
        className="pointer-events-none absolute inset-0 z-0 size-full"
      />

      <section className="relative z-10 flex min-h-svh flex-col items-center justify-center px-6 py-8 text-center">
        {/* Hero artwork — intentionally disabled, kept for an easy swap back in.
            Uncomment and change `src` to any image: the wrapper caps the width
            and `h-auto` derives the height, so no size tweaks are needed here.

        <div className="mb-10 w-full max-w-3xl overflow-hidden rounded-3xl">
          <Image
            src="/hero_image.jpg"
            alt="Better Components — animated components in motion"
            width={1024}
            height={1024}
            priority
            className="h-auto w-full"
          />
        </div>

        ...and add `import Image from "next/image"` at the top. */}

        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Better Components
        </h1>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          {/* The zero-config URL form — the @bettercomp namespace only works
              after registering it in components.json (explained in the docs). */}
          <InstallCommand command={installCommand("static-button")} />
          <Button
            asChild
            className="h-10 rounded-xl bg-blue-600 px-6 text-sm text-white hover:bg-blue-500"
          >
            <Link href="/docs">Get Started</Link>
          </Button>
        </div>

        <div className="mt-5 flex items-center gap-5 text-sm text-white/60">
          <Link href="/docs" className="transition-colors hover:text-white">
            Documentation
          </Link>
          <span className="size-1 rounded-full bg-white/30" />
          <Link href="/components" className="transition-colors hover:text-white">
            Components
          </Link>
        </div>
      </section>
    </div>
  )
}
