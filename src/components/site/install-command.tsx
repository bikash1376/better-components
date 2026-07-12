"use client"

import { useState } from "react"
import { CheckIcon, CopyIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

interface InstallCommandProps {
  command: string
  className?: string
}

export function InstallCommand({ command, className }: InstallCommandProps) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={copy}
      aria-label="Copy install command"
      className={cn(
        "group inline-flex max-w-full cursor-pointer items-center gap-3 rounded-xl bg-neutral-900 px-4 py-2.5",
        "font-mono text-xs text-neutral-100 transition-colors hover:bg-neutral-800",
        "sm:text-sm",
        className
      )}
    >
      {/* Scrolls inside the pill on a narrow screen rather than overflowing it. */}
      <span className="overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {command}
      </span>
      <span className="shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-100">
        {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      </span>
    </button>
  )
}
