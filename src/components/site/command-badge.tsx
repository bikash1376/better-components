"use client"

import { useState } from "react"
import { CheckIcon, CopyIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

interface CommandBadgeProps {
  command: string
  className?: string
}

/** Small inline install command with a little copy button at the end. */
export function CommandBadge({ command, className }: CommandBadgeProps) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={cn(
        // h-9 matches the other controls in the top bar. min-w-0 + max-w-full
        // so a long registry URL scrolls inside the pill instead of wrapping
        // to a second line or pushing off-screen.
        "inline-flex h-9 min-w-0 max-w-full items-center gap-2 rounded-lg border border-border/60 bg-background/70 py-1 pl-3 pr-1 shadow-sm backdrop-blur-md",
        "font-mono text-xs text-muted-foreground",
        className
      )}
    >
      <span className="overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {command}
      </span>
      <button
        onClick={copy}
        aria-label="Copy command"
        className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
      </button>
    </div>
  )
}
