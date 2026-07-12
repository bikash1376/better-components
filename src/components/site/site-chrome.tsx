"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { AnimatePresence, motion } from "motion/react"
import {
  BookOpenIcon,
  GithubLogoIcon,
  ListIcon,
  MoonIcon,
  MagnifyingGlassIcon,
  SunIcon,
  XIcon,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

export interface SearchItem {
  slug: string
  name: string
  category: string
}

/** Every control in the bar is this tall, so the row reads as one line. */
const buttonClass =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border/60 bg-background/70 text-foreground/70 shadow-sm backdrop-blur-md transition-colors hover:text-foreground"

/**
 * The top bar shared by the gallery and the component pages. One flex row —
 * Docs on the left, the page's own controls (install command, view code) in
 * the centre, search + menu on the right — so everything shares a baseline
 * instead of floating in three separately-positioned corners.
 *
 * The theme toggle lives inside the slide-in panel.
 */
export function SiteChrome({
  items,
  current,
  repoUrl,
  children,
}: {
  items: SearchItem[]
  current?: string
  repoUrl: string
  /** Centre slot — the install command and view-code button on detail pages. */
  children?: ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false)
        setMenuOpen(false)
      }
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 sm:px-6">
        <div className="flex h-16 items-center gap-3 sm:gap-4">
          <div className="flex flex-1 justify-start">
            <Link
              href="/docs"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/60 bg-background/70 px-3 text-sm text-foreground/80 shadow-sm backdrop-blur-md transition-colors hover:bg-muted hover:text-foreground"
            >
              <BookOpenIcon className="size-4" />
              Docs
            </Link>
          </div>

          {/* Centre slot. `min-w-0` lets a long install command shrink rather
              than shoving the side clusters out of alignment. There's no room
              for it beside the buttons on a phone — below md it moves to its
              own row underneath. */}
          {children && (
            <div className="hidden min-w-0 items-center gap-2 md:flex">
              {children}
            </div>
          )}

          <div className="flex flex-1 items-center justify-end gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search components"
              title="Search components (⌘K)"
              className={buttonClass}
            >
              <MagnifyingGlassIcon className="size-4" />
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={
                menuOpen ? "Close component list" : "Open component list"
              }
              className={buttonClass}
            >
              {menuOpen ? (
                <XIcon className="size-4" />
              ) : (
                <ListIcon className="size-4" />
              )}
            </button>
          </div>
        </div>

        {children && (
          <div className="flex min-w-0 items-center gap-2 pb-3 md:hidden">
            {children}
          </div>
        )}
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            {/* No background fill of its own — just heavy blur, so the page
                reads through the panel as glass. */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed right-0 top-0 z-40 flex h-full w-[85vw] max-w-80 flex-col border-l border-border/50 backdrop-blur-2xl"
            >
              <nav className="flex-1 overflow-auto px-6 pb-6 pt-24">
                {items.map((item, i) => (
                  <Link
                    key={item.slug}
                    href={`/components/${item.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="group flex cursor-pointer items-center gap-3 py-1"
                  >
                    <span
                      className={cn(
                        "h-px w-5 shrink-0 transition-all duration-300 group-hover:w-10",
                        item.slug === current
                          ? "w-10 bg-foreground"
                          : "bg-muted-foreground/40 group-hover:bg-foreground"
                      )}
                    />
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

              <div className="flex items-center justify-between border-t border-border/60 px-6 py-4">
                <ThemeToggle />
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View on GitHub"
                  title="View on GitHub"
                  className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <GithubLogoIcon className="size-4" />
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay items={items} onClose={() => setSearchOpen(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

/** Sun/moon switch. Renders a placeholder until mounted — the server can't know the theme. */
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {mounted ? (
        <>
          {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          {isDark ? "Light" : "Dark"}
        </>
      ) : (
        <span className="size-4" />
      )}
    </button>
  )
}

function SearchOverlay({
  items,
  onClose,
}: {
  items: SearchItem[]
  onClose: () => void
}) {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
    )
  }, [query, items])

  function go(slug: string) {
    onClose()
    router.push(`/components/${slug}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[18vh]"
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0 bg-background/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -12 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        style={{ transformOrigin: "top center" }}
        className={cn(
          "relative z-10 w-full max-w-lg overflow-hidden rounded-2xl",
          "border border-border/60 bg-background/70 shadow-2xl backdrop-blur-2xl"
        )}
      >
        <div className="flex items-center gap-3 border-b border-border/60 px-4">
          <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components..."
            className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) go(results[0].slug)
            }}
          />
        </div>
        <div className="max-h-72 overflow-auto p-2">
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No components found.
            </p>
          )}
          {results.map((item) => (
            <button
              key={item.slug}
              onClick={() => go(item.slug)}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-muted"
            >
              <span>{item.name}</span>
              <span className="text-xs text-muted-foreground">
                {item.category}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
