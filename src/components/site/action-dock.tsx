"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"
import { ChevronRight, Palette } from "lucide-react"

import { cn } from "@/lib/utils"
import { iconLibraries, useIcons } from "@/components/site/icons"

interface SearchItem {
  slug: string
  name: string
  category: string
}

interface ActionDockProps {
  variant?: "component" | "gallery"
  /** Full source shown in the code modal's Manual tab (component variant only). */
  code?: string
  /** Minimal usage example shown in the code modal's Auto tab. */
  usage?: string
  githubUrl: string
  items: SearchItem[]
}

type Panel = "code" | "search" | "lib" | null

const spring = { type: "spring" as const, stiffness: 400, damping: 26 }

export function ActionDock({
  variant = "component",
  code = "",
  usage = "",
  githubUrl,
  items,
}: ActionDockProps) {
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState<Panel>(null)
  const { icons } = useIcons()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Tracks the cursor's x within the dock for macOS-style magnification.
  const mouseX = useMotionValue(Infinity)

  // Intentional one-time mount flag so the theme icon only renders client-side.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === "dark"

  // Open on sustained hover (1s); once open it stays open (no auto-close).
  function handleEnter() {
    if (open) return
    hoverTimer.current = setTimeout(() => setOpen(true), 1000)
  }
  function handleLeave() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPanel(null)
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
        setPanel((p) => (p === "search" ? null : "search"))
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const actions = [
    {
      key: "theme",
      label: isDark ? "Light mode" : "Dark mode",
      Icon: isDark ? icons.sun : icons.moon,
      onClick: () => setTheme(isDark ? "light" : "dark"),
    },
    {
      key: "lib",
      label: "Change icon library",
      Icon: Palette,
      onClick: () => setPanel((p) => (p === "lib" ? null : "lib")),
    },
    ...(variant === "component"
      ? [
          {
            key: "code",
            label: "View code",
            Icon: icons.code,
            onClick: () => setPanel((p) => (p === "code" ? null : "code")),
          },
        ]
      : []),
    {
      key: "search",
      label: "Search components",
      Icon: icons.search,
      onClick: () => setPanel((p) => (p === "search" ? null : "search")),
    },
    {
      key: "github",
      label: "View on GitHub",
      Icon: icons.github,
      href: githubUrl,
    },
  ]

  return (
    <>
      <div
        onMouseEnter={handleEnter}
        onMouseLeave={() => {
          handleLeave()
          mouseX.set(Infinity)
        }}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        className="fixed bottom-6 right-6 z-40 flex items-end gap-3 pl-10 pt-10"
      >
        <AnimatePresence>
          {open &&
            actions.map(({ key, ...action }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: 24, scale: 0.4 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.4 }}
                transition={{ ...spring, delay: open ? i * 0.05 : 0 }}
              >
                <DockButton {...action} mouseX={mouseX} />
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Handle */}
        {open ? (
          <motion.button
            layout
            onClick={() => {
              setOpen(false)
              setPanel(null)
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Collapse menu"
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-2xl border border-border/60 bg-background/70 text-foreground/80 shadow-sm backdrop-blur-md hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </motion.button>
        ) : (
          <motion.button
            layout
            onClick={() => setOpen(true)}
            whileHover={{ scaleY: 1.5 }}
            whileTap={{ scale: 0.92 }}
            style={{ transformOrigin: "bottom" }}
            aria-label="Open menu"
            className="h-12 w-2.5 cursor-pointer rounded-full bg-foreground/25 shadow-sm backdrop-blur-md transition-colors hover:bg-foreground/40"
          />
        )}
      </div>

      <AnimatePresence>
        {panel === "code" && (
          <CodeModal
            key="code"
            code={code}
            usage={usage}
            onClose={() => setPanel(null)}
          />
        )}
        {panel === "search" && (
          <SearchOverlay
            key="search"
            items={items}
            onClose={() => setPanel(null)}
          />
        )}
        {panel === "lib" && <LibraryPicker key="lib" onClose={() => setPanel(null)} />}
      </AnimatePresence>
    </>
  )
}

function DockButton({
  label,
  Icon,
  onClick,
  href,
  mouseX,
}: {
  label: string
  Icon: React.ComponentType<{ className?: string }>
  onClick?: () => void
  href?: string
  mouseX: MotionValue<number>
}) {
  const ref = useRef<HTMLDivElement>(null)

  // Distance from cursor to this icon's center → drives macOS-style magnify.
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect()
    if (!bounds) return Infinity
    return val - bounds.x - bounds.width / 2
  })
  const sizeSync = useTransform(distance, [-140, 0, 140], [44, 76, 44])
  const size = useSpring(sizeSync, { stiffness: 300, damping: 20, mass: 0.1 })

  const className = cn(
    "flex size-full cursor-pointer items-center justify-center rounded-2xl border border-border/60",
    "bg-background/70 text-foreground/80 shadow-sm backdrop-blur-md",
    "hover:bg-background hover:text-foreground"
  )
  const inner = <Icon className="size-[38%]" />

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      className="origin-bottom"
    >
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
          className={className}
        >
          {inner}
        </a>
      ) : (
        <button
          onClick={onClick}
          aria-label={label}
          title={label}
          className={className}
        >
          {inner}
        </button>
      )}
    </motion.div>
  )
}

function CodeModal({
  code,
  usage,
  onClose,
}: {
  code: string
  usage?: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  // Auto = how to use the component; Manual = the full source to paste in.
  const [tab, setTab] = useState<"auto" | "manual">(usage ? "auto" : "manual")
  const { icons } = useIcons()

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
        initial={{ opacity: 0, scale: 0.85, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        style={{ transformOrigin: "bottom right" }}
        className={cn(
          "relative z-10 flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl",
          "border border-border/60 bg-background/80 shadow-2xl backdrop-blur-xl"
        )}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
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
            <span className="font-mono text-xs text-muted-foreground">
              source
            </span>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={copy}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {copied ? (
                <icons.check className="size-3.5" />
              ) : (
                <icons.copy className="size-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <icons.close className="size-4" />
            </button>
          </div>
        </div>
        {tab === "auto" && usage && (
          <p className="border-b border-border/60 px-4 py-2 text-xs text-muted-foreground">
            Drop this in after installing — the component lives at{" "}
            <code className="font-mono">components/better/</code>.
          </p>
        )}
        <pre className="overflow-auto p-4 text-sm leading-relaxed">
          <code className="font-mono">{shown}</code>
        </pre>
      </motion.div>
    </div>
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
  const { icons } = useIcons()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
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
          <icons.search className="size-4 text-muted-foreground" />
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

function LibraryPicker({ onClose }: { onClose: () => void }) {
  const { lib, setLib } = useIcons()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={spring}
      style={{ transformOrigin: "bottom right" }}
      className="fixed bottom-20 right-6 z-50 w-44 overflow-hidden rounded-2xl border border-border/60 bg-background/80 p-1.5 shadow-2xl backdrop-blur-xl"
    >
      <p className="px-2.5 py-1.5 text-xs text-muted-foreground">Icon library</p>
      {iconLibraries.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => {
            setLib(id)
            onClose()
          }}
          className={cn(
            "flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-muted",
            lib === id && "bg-muted"
          )}
        >
          {label}
          {lib === id && <span className="size-1.5 rounded-full bg-foreground" />}
        </button>
      ))}
    </motion.div>
  )
}
