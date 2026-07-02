"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"
import { useIcons } from "@/components/site/icons"

interface Item {
  slug: string
  name: string
}

/** Top-right toggle that opens a slide-in list of all components. */
export function ComponentSidebar({
  items,
  current,
}: {
  items: Item[]
  current?: string
}) {
  const [open, setOpen] = useState(false)
  const { icons } = useIcons()

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.85 }}
        animate={{ rotate: open ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        aria-label="Toggle component list"
        className="fixed right-6 top-6 z-50 inline-flex size-11 cursor-pointer items-center justify-center rounded-2xl border border-border/60 bg-background/70 text-foreground/80 shadow-sm backdrop-blur-md hover:text-foreground"
      >
        {open ? (
          <icons.close className="size-4" />
        ) : (
          <icons.sidebar className="size-4" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-border bg-background/85 backdrop-blur-xl"
            >
              <p className="px-6 pb-4 pt-20 text-xs uppercase tracking-wider text-muted-foreground">
                Components
              </p>
              <nav className="flex-1 overflow-auto px-6 pb-6">
                {items.map((item, i) => (
                  <Link
                    key={item.slug}
                    href={`/components/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="group flex cursor-pointer items-center gap-3 py-1"
                  >
                    <span className="h-px w-5 shrink-0 bg-muted-foreground/40 transition-all duration-300 group-hover:w-10 group-hover:bg-foreground" />
                    <span
                      className={cn(
                        "text-sm transition-colors",
                        item.slug === current
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      <span className="tabular-nums text-muted-foreground/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>{" "}
                      {item.name}
                    </span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
