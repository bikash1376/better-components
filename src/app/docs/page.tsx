import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { CodeBlock } from "@/components/site/code-block"
import { visibleComponents } from "@/registry"

export const metadata: Metadata = {
  title: "Docs · Better Components",
  description: "How to install and use Better Components.",
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-border pt-10">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

function Step({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium text-foreground">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{title}</p>
        <div className="mt-2 space-y-3">{children}</div>
      </div>
    </div>
  )
}

function Card({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <CodeBlock code={code} lang={lang} />
    </div>
  )
}

export default function DocsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Home
        </Link>
        <Link
          href="/components"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Browse components
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <h1 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">
        Documentation
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Better Components are distributed as a{" "}
        <a
          href="https://ui.shadcn.com/docs/registry"
          target="_blank"
          rel="noreferrer"
          className="text-foreground underline underline-offset-4"
        >
          shadcn registry
        </a>
        . There is no package to depend on — the CLI copies a component&apos;s
        source straight into your project, so you own and can edit every line.
      </p>

      <div className="mt-12 space-y-10">
        <Section title="Installation">
          <Step n={1} title="Start from a shadcn-ready project">
            <p>
              You need a React app (Next.js, Vite, …) with Tailwind CSS v4 and
              shadcn initialised. If you haven&apos;t already:
            </p>
            <Card lang="bash" code="npx shadcn@latest init" />
          </Step>

          <Step n={2} title="Add a component">
            <p>
              Every component page lists its command. Once the registry is
              deployed, the <code className="font-mono text-foreground">@bettercomp</code>{" "}
              namespace resolves to it:
            </p>
            <Card
              lang="bash"
              code="npx shadcn@latest add @bettercomp/static-button"
            />
            <p>
              The namespace is configured once in your{" "}
              <code className="font-mono text-foreground">components.json</code>:
            </p>
            <Card
              lang="json"
              code={`{
  "registries": {
    "@bettercomp": "https://better-components-alpha.vercel.app/r/{name}.json"
  }
}`}
            />
            <p>
              Or skip the namespace and point the CLI straight at the JSON URL:
            </p>
            <Card
              lang="bash"
              code="npx shadcn@latest add https://better-components-alpha.vercel.app/r/static-button.json"
            />
            <p>
              Either way the CLI writes the file to{" "}
              <code className="font-mono text-foreground">
                components/better/
              </code>{" "}
              and installs its npm dependencies (e.g.{" "}
              <code className="font-mono text-foreground">motion</code>).
            </p>
          </Step>

          <Step n={3} title="Use it">
            <p>Import and drop it in — then tweak the props:</p>
            <Card
              lang="tsx"
              code={`import { StaticButton } from "@/components/better/static-button"

export function Example() {
  return <StaticButton variant="primary">Buy</StaticButton>
}`}
            />
            <p>
              Each component page has a live{" "}
              <span className="text-foreground">Playground</span> so you can dial
              in the props visually and copy the exact code.
            </p>
          </Step>
        </Section>

        <Section title="Manual install (copy &amp; paste)">
          <p>
            Prefer not to use the CLI? Open any component, hover the dock in the
            bottom-right, and choose{" "}
            <span className="text-foreground">View code</span>. The{" "}
            <span className="text-foreground">Manual</span> tab is the full,
            syntax-highlighted source — paste it into{" "}
            <code className="font-mono text-foreground">
              components/better/&lt;name&gt;.tsx
            </code>{" "}
            and install the dependencies listed on the page. The{" "}
            <span className="text-foreground">Auto</span> tab is a ready-to-paste
            usage snippet.
          </p>
        </Section>

        <Section title="Browse the library">
          <p>
            {visibleComponents.length} components across UI, Typography, Stop
            Motion, Loaders, Carousel, Mouse, and the Animate editor.
          </p>
          <Link
            href="/components"
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Explore components
            <ArrowRight className="size-4" />
          </Link>
        </Section>
      </div>
    </main>
  )
}
