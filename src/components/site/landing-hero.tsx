import Link from "next/link"

import { Button } from "@/components/ui/button"
import { InstallCommand } from "@/components/site/install-command"

/**
 * Landing hero — a prismatic aurora burst behind the title. Static: no scroll
 * container, no zoom, nothing that reacts to the wheel.
 */
export function LandingHero() {
  return (
    <div className="relative min-h-svh w-full bg-black">
      {/* Prismatic Aurora Burst — layered radial gradients over black. */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 70% 20%, rgba(255, 20, 147, 0.15), transparent 50%),
            radial-gradient(ellipse 100% 60% at 30% 10%, rgba(0, 255, 255, 0.12), transparent 60%),
            radial-gradient(ellipse 90% 70% at 50% 0%, rgba(138, 43, 226, 0.18), transparent 65%),
            radial-gradient(ellipse 110% 50% at 80% 30%, rgba(255, 215, 0, 0.08), transparent 40%),
            #000000
          `,
        }}
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
          <InstallCommand command="npx shadcn@latest add @bettercomp/static-button" />
          <Button
            asChild
            className="h-10 rounded-xl bg-blue-600 px-6 text-sm text-white hover:bg-blue-500"
          >
            <Link href="/components">Get Started</Link>
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
