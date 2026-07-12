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
        "inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 py-1 pl-3 pr-1",
        "font-mono text-xs text-muted-foreground",
        className
      )}
    >
      <span>{command}</span>
      <button
        onClick={copy}
        aria-label="Copy command"
        className="inline-flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
      </button>
    </div>
  )
}
