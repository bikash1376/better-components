import { readFile } from "node:fs/promises"
import path from "node:path"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { ActionDock } from "@/components/site/action-dock"
import { CommandWithTooltip } from "@/components/site/command-with-tooltip"
import { ComponentSidebar } from "@/components/site/component-sidebar"
import { ComponentPlayground } from "@/components/site/playground"
import {
  GITHUB_BASE,
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
    return (
      <main className="relative flex h-svh flex-col">
        <Link
          href="/components"
          className="fixed left-5 top-5 z-50 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/80 px-3 py-1.5 text-sm text-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <div className="min-h-0 flex-1 p-3">
          <component.Demo />
        </div>
      </main>
    )
  }

  return (
    <main className="relative flex min-h-svh flex-1 flex-col px-6 py-16">
      <ComponentSidebar items={searchItems} current={slug} />

      <div
        className={cn(
          "mx-auto w-full",
          component.playground ? "max-w-5xl" : "max-w-4xl"
        )}
      >
        <CommandWithTooltip
          command={component.install}
          name={component.name}
          description={component.description}
        />
        {component.playground ? (
          <div className="mt-4">
            <ComponentPlayground slug={slug} />
          </div>
        ) : (
          <div className="mt-4 flex min-h-[440px] w-full items-center justify-center rounded-2xl border border-border bg-muted/20">
            <component.Demo />
          </div>
        )}
      </div>

      <ActionDock
        variant="component"
        code={code}
        usage={component.usage}
        githubUrl={githubUrl}
        items={searchItems}
      />
    </main>
  )
}
