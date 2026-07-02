"use client"

import { useState } from "react"
import { Highlight, type PrismTheme } from "prism-react-renderer"

import { cn } from "@/lib/utils"
import { useIcons } from "@/components/site/icons"

/**
 * A Prism theme whose colours are CSS variables, so a single theme adapts to
 * light/dark (the variables are redefined under `.dark` in globals.css).
 */
const theme: PrismTheme = {
  plain: { color: "var(--code-plain)", backgroundColor: "transparent" },
  styles: [
    { types: ["comment", "prolog", "doctype", "cdata"], style: { color: "var(--code-comment)", fontStyle: "italic" } },
    { types: ["punctuation"], style: { color: "var(--code-punctuation)" } },
    { types: ["tag", "deleted"], style: { color: "var(--code-tag)" } },
    { types: ["attr-name", "property"], style: { color: "var(--code-attr)" } },
    { types: ["keyword", "atrule", "builtin", "selector"], style: { color: "var(--code-keyword)" } },
    { types: ["string", "char", "attr-value", "inserted", "regex"], style: { color: "var(--code-string)" } },
    { types: ["function", "class-name"], style: { color: "var(--code-function)" } },
    { types: ["number", "boolean", "constant", "symbol"], style: { color: "var(--code-number)" } },
    { types: ["operator", "entity", "url", "variable"], style: { color: "var(--code-plain)" } },
  ],
}

interface CodeBlockProps {
  code: string
  /** Prism language id, e.g. "tsx", "bash". */
  lang?: string
  className?: string
  /** Show the floating copy button (default true). */
  copy?: boolean
}

export function CodeBlock({
  code,
  lang = "tsx",
  className,
  copy = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const { icons } = useIcons()

  async function onCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn("group relative", className)}>
      {copy && (
        <button
          onClick={onCopy}
          aria-label="Copy code"
          className="absolute right-2 top-2 z-10 inline-flex size-7 cursor-pointer items-center justify-center rounded-md border border-border/60 bg-background/70 text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-foreground group-hover:opacity-100"
        >
          {copied ? (
            <icons.check className="size-3.5" />
          ) : (
            <icons.copy className="size-3.5" />
          )}
        </button>
      )}
      <Highlight theme={theme} code={code.trim()} language={lang}>
        {({ className: hlClass, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            style={style}
            className={cn(
              hlClass,
              "overflow-auto rounded-xl bg-transparent p-4 font-mono text-[13px] leading-relaxed"
            )}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
