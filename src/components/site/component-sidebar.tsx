"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIcons } from "@/components/site/icons"

interface Item {
  slug: string
  name: string
  category?: string
}

/** Group items by category while preserving the order they first appear. */
function groupByCategory(items: Item[]) {
  const groups = new Map<string, Item[]>()
  for (const item of items) {
    const key = item.category ?? "Components"
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(item)
  }
  return [...groups.entries()]
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
  const groups = groupByCategory(items)

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
              <div className="px-6 pb-4 pt-20">
                <p className="font-mono text-sm font-semibold tracking-tight">
                  bettercomp
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {items.length} in the library
                </p>
              </div>

              <nav className="flex-1 overflow-auto px-3 pb-6">
                {groups.map(([category, group]) => (
                  <div key={category} className="mb-1">
                    <p className="px-3 pb-1 pt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60">
                      {category}
                    </p>
                    {group.map((item) => {
                      const active = item.slug === current
                      return (
                        <Link
                          key={item.slug}
                          href={`/components/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "group relative flex items-center justify-between rounded-lg px-3 py-2 transition-colors",
                            active ? "bg-muted" : "hover:bg-muted/60"
                          )}
                        >
                          {active && (
                            <motion.span
                              layoutId="sidebar-active"
                              className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-foreground"
                            />
                          )}
                          <span className="flex items-center gap-2.5">
                            <span
                              className={cn(
                                "size-1.5 rounded-full transition-colors",
                                active
                                  ? "bg-foreground"
                                  : "bg-muted-foreground/30 group-hover:bg-foreground/60"
                              )}
                            />
                            <span
                              className={cn(
                                "text-sm transition-colors",
                                active
                                  ? "font-medium text-foreground"
                                  : "text-muted-foreground group-hover:text-foreground"
                              )}
                            >
                              {item.name}
                            </span>
                          </span>
                          <ArrowUpRight className="size-3.5 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                        </Link>
                      )
                    })}
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
