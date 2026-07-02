import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { InstallCommand } from "@/components/site/install-command"

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 py-8 text-center">
      <div className="relative max-h-[68svh] w-full max-w-3xl overflow-hidden rounded-t-3xl [mask-image:linear-gradient(to_bottom,black_35%,transparent_92%)]">
        <Image
          src="/hero_image.jpg"
          alt="Better Components — animated components in motion"
          width={1024}
          height={1024}
          priority
          className="h-auto w-full"
        />
      </div>

      <h1 className="relative z-10 -mt-20 text-4xl font-semibold tracking-tight sm:text-5xl">
        Better Components
      </h1>

      <div className="relative z-10 mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <InstallCommand command="npx shadcn add @better-comp" />
        <Button
          asChild
          className="h-10 rounded-xl bg-blue-600 px-6 text-sm text-white hover:bg-blue-500"
        >
          <Link href="/components">Get Started</Link>
        </Button>
      </div>
    </main>
  )
}
