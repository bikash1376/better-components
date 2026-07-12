import type { Metadata } from "next"
import Link from "next/link"

import { GalleryCard } from "@/components/site/gallery-card"
import { SiteChrome } from "@/components/site/site-chrome"
import {
  REPO_URL,
  componentsByCategory,
  newCategories,
  visibleComponents,
} from "@/registry"

export const metadata: Metadata = {
  title: "Components · Better Components",
}

export default function ComponentsPage() {
  const groups = componentsByCategory()
  const searchItems = visibleComponents.map((c) => ({
    slug: c.slug,
    name: c.name,
    category: c.category,
  }))

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <SiteChrome items={searchItems} repoUrl={REPO_URL} />

      <div className="mb-12 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Components</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse the library. Each has a live playground and copy-paste source.
          </p>
        </div>
        <Link
          href="/docs"
          className="mr-24 shrink-0 rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
        >
          Docs
        </Link>
      </div>

      <div className="space-y-14">
        {groups.map(({ category, items }) => (
          <section key={category}>
            <h2 className="mb-5 flex items-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {category}
              <span className="ml-2 text-muted-foreground/60">
                {items.length}
              </span>
              {newCategories.includes(category) && (
                <span className="ml-2.5 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-blue-500">
                  New
                </span>
              )}
            </h2>

            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground/70">
                No components yet.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <GalleryCard
                    key={item.slug}
                    slug={item.slug}
                    name={item.name}
                    description={item.description}
                    demo={item.staticPreview ? <item.Poster /> : <item.Demo />}
                    poster={<item.Poster />}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  )
}
