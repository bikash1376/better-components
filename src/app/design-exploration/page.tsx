import type { Metadata } from "next"

import { SoftBlurIn } from "./_components/soft-blur-in"
import { UnderlineLink } from "./_components/underline-link"

export const metadata: Metadata = {
  title: "design exploration",
}

export default function DesignExplorationIndex() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-neutral-950 px-6">
      {/* inline-block so the signature anchors to the text's own right edge
          rather than the viewport's. */}
      <div className="relative inline-block">
        <UnderlineLink
          href="/design-exploration/contents"
          className="font-(family-name:--font-newsreader) text-5xl font-extralight tracking-tight text-neutral-100 sm:text-8xl"
        >
          <SoftBlurIn text="design exploration" />
        </UnderlineLink>

        {/* Re-enable by swapping the text for <SoftBlurIn text="with bikash"
            delay={0.9} /> to stagger it in behind the title. */}
        {/* <span className="absolute -bottom-12 right-0 font-(family-name:--font-newsreader) text-xl font-extralight italic text-neutral-200 sm:text-4xl">
          with bikash
        </span> */}
      </div>
    </main>
  )
}
