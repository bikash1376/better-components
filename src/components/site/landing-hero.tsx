"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "motion/react"

import { Button } from "@/components/ui/button"
import { InstallCommand } from "@/components/site/install-command"

/**
 * A one-page cover: the hero image fills the screen and zooms bigger as you
 * scroll (pinned the whole time), fading into the background just above the
 * title — like a full-bleed cover site.
 */
export function LandingHero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })
  // Starts zoomed-in and zooms out toward full-cover as you scroll.
  const scale = useTransform(scrollYProgress, [0, 1], [1.22, 1])

  return (
    <section ref={ref} className="relative h-[170svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <motion.div style={{ scale }} className="absolute inset-0 origin-center">
          <Image
            src="/hero_image.jpg"
            alt="Better Components — animated components in motion"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
        </motion.div>

        {/* The image fades into the page background just above the title. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/85 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-6 pb-[9vh] text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Better Components
          </h1>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <InstallCommand command="npx shadcn@latest add @bettercomp/static-button" />
            <Button
              asChild
              className="h-10 rounded-xl bg-blue-600 px-6 text-sm text-white hover:bg-blue-500"
            >
              <Link href="/components">Get Started</Link>
            </Button>
          </div>

          <div className="mt-5 flex items-center gap-5 text-sm text-muted-foreground">
            <Link href="/docs" className="transition-colors hover:text-foreground">
              Documentation
            </Link>
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            <Link
              href="/components"
              className="transition-colors hover:text-foreground"
            >
              Components
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
