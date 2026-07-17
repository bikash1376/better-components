import type { Metadata } from "next"

import { UnderlineLink } from "../_components/underline-link"

export const metadata: Metadata = {
  title: "contents",
}

/** Add a line here as each exploration lands. */
const EXPLORATIONS = [{ name: "a dock of faces", href: "/design-exploration/1" }]

export default function DesignExplorationContents() {
  return (
    <main className="flex min-h-svh items-start justify-start bg-neutral-950 px-8 py-16 sm:px-16 sm:py-24">
      <ul className="flex flex-col items-start gap-10">
        {EXPLORATIONS.map((exploration) => (
          <li key={exploration.href}>
            <UnderlineLink
              href={exploration.href}
              className="font-(family-name:--font-figtree) text-4xl font-light text-neutral-100 sm:text-6xl"
            >
              {exploration.name}
            </UnderlineLink>
          </li>
        ))}
      </ul>
    </main>
  )
}
