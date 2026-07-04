"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Compass } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const linkClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/80 px-3 py-1.5 text-sm text-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted cursor-pointer"

/**
 * Top bar for full-bleed app pages (Animate). "Back" prompts a confirmation
 * first since leaving discards any unsaved work in the editor.
 */
export function FullBleedTopBar({ backHref }: { backHref: string }) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2.5">
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className={linkClass}
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      {/* Opposite the Back button: relaunch the editor walkthrough. */}
      <button
        type="button"
        onClick={() =>
          window.dispatchEvent(new Event("bettercomp:start-tour"))
        }
        className={linkClass}
      >
        <Compass className="size-4" />
        Take a tour
      </button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Leave the editor?</DialogTitle>
            <DialogDescription>
              Your work here isn&apos;t saved. If you leave now, you&apos;ll lose
              your current progress.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="cursor-pointer rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              Stay
            </button>
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="cursor-pointer rounded-lg bg-destructive/15 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/25"
            >
              Leave anyway
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
