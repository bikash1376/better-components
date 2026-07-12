"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { CheckIcon, CodeIcon, CopyIcon, GithubLogoIcon, XIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { CodeBlock } from "@/components/site/code-block"

interface ViewCodeProps {
  /** Full source, shown in the Manual tab. */
  code: string
  /** Minimal usage example, shown in the Auto tab. */
  usage?: string
  /** Deep link to this component's source on GitHub. */
  githubUrl: string
}

/**
 * The view-code affordance that sits next to the install command: an icon
 * button that opens the source, with a GitHub link to the file in the header.
 */
export function ViewCode({ code, usage, githubUrl }: ViewCodeProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="View code"
        title="View code"
        className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border/60 bg-background/70 text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-muted hover:text-foreground"
      >
        <CodeIcon className="size-4" />
      </button>

      <AnimatePresence>
        {open && (
          <CodeModal
            code={code}
            usage={usage}
            githubUrl={githubUrl}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function CodeModal({
  code,
  usage,
  githubUrl,
  onClose,
}: ViewCodeProps & { onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  // Auto = how to use the component; Manual = the full source to paste in.
  const [tab, setTab] = useState<"auto" | "manual">(usage ? "auto" : "manual")

  const shown = tab === "auto" && usage ? usage : code

  async function copy() {
    await navigator.clipboard.writeText(shown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className={cn(
          "relative z-10 flex max-h-[85svh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl",
          "border border-border/60 bg-background/80 shadow-2xl backdrop-blur-xl"
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-3 sm:px-4">
          {usage ? (
            <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-0.5">
              {(["auto", "manual"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium capitalize",
                    tab === t
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : (
            <span className="font-mono text-xs text-muted-foreground">source</span>
          )}

          <div className="flex items-center gap-1">
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="View this file on GitHub"
              title="View this file on GitHub"
              className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <GithubLogoIcon className="size-4" />
            </a>
            <button
              onClick={copy}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {copied ? (
                <CheckIcon className="size-3.5" />
              ) : (
                <CopyIcon className="size-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </div>

        {tab === "auto" && usage && (
          <p className="border-b border-border/60 px-4 py-2 text-xs text-muted-foreground">
            Drop this in after installing — the component lives at{" "}
            <code className="font-mono">components/better/</code>.
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-auto">
          <CodeBlock code={shown} lang="tsx" copy={false} />
        </div>
      </motion.div>
    </div>
  )
}
