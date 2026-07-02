"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "motion/react"

import { Button } from "@/components/ui/button"
import { InstallCommand } from "@/components/site/install-command"

/**
 * The original contained hero (full artwork, faded into the background above
 * the title) with a gentle zoom-out as you scroll — settles to its natural
 * size, never cropped.
 */
export function LandingHero() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    container: scrollRef,
    target: ref,
    offset: ["start start", "end end"],
  })
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1])

  return (
    <div
      ref={scrollRef}
      className="h-svh overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <section ref={ref} className="relative h-[150svh]">
        <div className="sticky top-0 flex h-svh flex-col items-center justify-center px-6 py-8 text-center">
        <motion.div
          style={{ scale }}
          className="relative max-h-[68svh] w-full max-w-3xl overflow-hidden rounded-t-3xl [mask-image:linear-gradient(to_bottom,black_35%,transparent_92%)]"
        >
          <Image
            src="/hero_image.jpg"
            alt="Better Components — animated components in motion"
            width={1024}
            height={1024}
            priority
            className="h-auto w-full"
          />
        </motion.div>

        <h1 className="relative z-10 -mt-20 text-4xl font-semibold tracking-tight sm:text-5xl">
          Better Components
        </h1>

        <div className="relative z-10 mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <InstallCommand command="npx shadcn@latest add @bettercomp/static-button" />
          <Button
            asChild
            className="h-10 rounded-xl bg-blue-600 px-6 text-sm text-white hover:bg-blue-500"
          >
            <Link href="/components">Get Started</Link>
          </Button>
        </div>

        <div className="relative z-10 mt-5 flex items-center gap-5 text-sm text-muted-foreground">
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
      </section>
    </div>
  )
}
