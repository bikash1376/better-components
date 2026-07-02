"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

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
        "group inline-flex cursor-pointer items-center gap-3 rounded-xl bg-neutral-900 px-4 py-2.5",
        "font-mono text-xs text-neutral-100 transition-colors hover:bg-neutral-800",
        "sm:text-sm",
        className
      )}
    >
      <span>
        npx shadcn@latest add{" "}
        <span className="text-neutral-100">@bettercomp</span>
      </span>
      <span className="text-neutral-400 transition-colors group-hover:text-neutral-100">
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </span>
    </button>
  )
}
