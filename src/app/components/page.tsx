import type { Metadata } from "next"

import { ActionDock } from "@/components/site/action-dock"
import { GalleryCard } from "@/components/site/gallery-card"
import {
  GITHUB_BASE,
  components,
  componentsByCategory,
  newCategories,
} from "@/registry"

export const metadata: Metadata = {
  title: "Components · Better Components",
}

export default function ComponentsPage() {
  const groups = componentsByCategory()
  const searchItems = components.map((c) => ({
    slug: c.slug,
    name: c.name,
    category: c.category,
  }))

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
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
                    demo={<item.Demo />}
                    poster={<item.Poster />}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <ActionDock
        variant="gallery"
        githubUrl={`${GITHUB_BASE}/src/components/better`}
        items={searchItems}
      />
    </main>
  )
}
