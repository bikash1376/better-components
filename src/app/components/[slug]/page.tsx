import { readFile } from "node:fs/promises"
import path from "node:path"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { cn } from "@/lib/utils"
import { installCommand } from "@/lib/registry"
import { extractPropsTables } from "@/lib/props"
import { CommandWithTooltip } from "@/components/site/command-with-tooltip"
import { FullBleedTopBar } from "@/components/site/fullbleed-top-bar"
import { PropsTables } from "@/components/site/props-table"
import { SiteChrome } from "@/components/site/site-chrome"
import { ViewCode } from "@/components/site/view-code"
import { ComponentPlayground } from "@/components/site/playground"
import {
  GITHUB_BASE,
  REPO_URL,
  components,
  getComponent,
  visibleComponents,
} from "@/registry"

export function generateStaticParams() {
  return components.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const component = getComponent(slug)
  return {
    title: component ? `${component.name} · Better Components` : "Not found",
  }
}

async function readSource(sourcePath: string) {
  try {
    return await readFile(path.join(process.cwd(), sourcePath), "utf8")
  } catch {
    return "// Source unavailable."
  }
}

/** npm dependencies for a component, straight from the registry manifest. */
async function readDependencies(slug: string): Promise<string[] | null> {
  try {
    const manifest = JSON.parse(
      await readFile(path.join(process.cwd(), "registry.json"), "utf8")
    ) as { items: { name: string; dependencies?: string[] }[] }
    const item = manifest.items.find((i) => i.name === slug)
    return item ? (item.dependencies ?? []) : null
  } catch {
    return null
  }
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const component = getComponent(slug)
  if (!component) notFound()

  const code = await readSource(component.sourcePath)
  const githubUrl = `${GITHUB_BASE}/${component.sourcePath}`
  const searchItems = visibleComponents.map((c) => ({
    slug: c.slug,
    name: c.name,
    category: c.category,
  }))

  if (component.fullBleed) {
    // Multi-file apps aren't in the shadcn registry — GitHub is how you get
    // the source, so link the whole folder rather than one file.
    const sourceDirUrl = `${REPO_URL}/tree/main/${path
      .dirname(component.sourcePath)
      .replaceAll("\\", "/")}`
    return (
      <main className="relative flex h-svh flex-col">
        {/* In-flow top bar so it never overlaps the editor's own toolbar.
            Back confirms first — leaving discards unsaved editor progress. */}
        <FullBleedTopBar backHref="/components" sourceUrl={sourceDirUrl} />
        <div className="min-h-0 flex-1 px-3 pb-3">
          <component.Demo />
        </div>
      </main>
    )
  }

  const dependencies = await readDependencies(slug)
  const propsTables = extractPropsTables(code)
  if (component.extraProps && propsTables.length > 0) {
    propsTables[0].rows.unshift(...component.extraProps)
  }

  return (
    // pt clears the fixed top bar — taller below md, where the install command
    // sits on its own second row.
    <main className="relative flex min-h-svh flex-1 flex-col px-4 pb-16 pt-32 sm:px-6 md:pt-24">
      {/* The install command rides in the top bar's centre slot, so it lines up
          with Docs and the search/menu buttons instead of sitting below them. */}
      <SiteChrome items={searchItems} current={slug} repoUrl={REPO_URL}>
        <CommandWithTooltip
          command={installCommand(slug)}
          name={component.name}
          description={component.description}
        />
        <ViewCode code={code} usage={component.usage} githubUrl={githubUrl} />
      </SiteChrome>

      <div
        className={cn(
          "mx-auto w-full",
          component.playground ? "max-w-5xl" : "max-w-4xl"
        )}
      >
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {component.category}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {component.name}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {component.description}
          </p>
        </div>

        {component.playground ? (
          <ComponentPlayground slug={slug} />
        ) : (
          <div className="flex min-h-[440px] w-full items-center justify-center rounded-2xl border border-border bg-muted/20">
            <component.Demo />
          </div>
        )}

        {/* Referenced by the docs' manual-install steps: what to `npm i` when
            pasting the source by hand (the CLI installs these itself). */}
        {dependencies && (
          <section className="mt-14">
            <h2 className="text-lg font-semibold tracking-tight">
              Dependencies
            </h2>
            {dependencies.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                None — just React and Tailwind CSS.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {dependencies.map((dep) => (
                  <a
                    key={dep}
                    href={`https://www.npmjs.com/package/${dep}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 font-mono text-xs text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {dep}
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        <PropsTables tables={propsTables} />
      </div>
    </main>
  )
}
