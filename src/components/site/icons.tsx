"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ComponentType,
} from "react"

// lucide-react (no brand icons in this version → inline github svg below)
import {
  Bell as LuBell,
  Check as LuCheck,
  Code2 as LuCode,
  Copy as LuCopy,
  Heart as LuHeart,
  Home as LuHome,
  Mail as LuMail,
  Moon as LuMoon,
  PanelLeft as LuSidebar,
  Plus as LuPlus,
  Search as LuSearch,
  Settings as LuSettings,
  Star as LuStar,
  Sun as LuSun,
  User as LuUser,
  X as LuX,
} from "lucide-react"
// react-icons (Feather set)
import {
  FiBell,
  FiCheck,
  FiCode,
  FiCopy,
  FiGithub,
  FiHeart,
  FiHome,
  FiMail,
  FiMoon,
  FiPlus,
  FiSearch,
  FiSettings,
  FiSidebar,
  FiStar,
  FiSun,
  FiUser,
  FiX,
} from "react-icons/fi"
// phosphor
import {
  Bell as PhBell,
  Check as PhCheck,
  Code as PhCode,
  Copy as PhCopy,
  Envelope as PhMail,
  Gear as PhSettings,
  GithubLogo as PhGithub,
  Heart as PhHeart,
  House as PhHome,
  MagnifyingGlass as PhSearch,
  Moon as PhMoon,
  Plus as PhPlus,
  Sidebar as PhSidebar,
  Star as PhStar,
  Sun as PhSun,
  User as PhUser,
  X as PhX,
} from "@phosphor-icons/react"
// remix
import {
  RiAddLine,
  RiCheckLine,
  RiCodeLine,
  RiCloseLine,
  RiFileCopyLine,
  RiGithubLine,
  RiHeartLine,
  RiHome2Line,
  RiLayoutLeftLine,
  RiMailLine,
  RiMoonLine,
  RiNotification2Line,
  RiSearchLine,
  RiSettings3Line,
  RiStarLine,
  RiSunLine,
  RiUserLine,
} from "@remixicon/react"

export type IconLib = "lucide" | "react-icons" | "phosphor" | "remix"
export type IconName =
  | "code"
  | "search"
  | "github"
  | "copy"
  | "check"
  | "close"
  | "sidebar"
  | "bell"
  | "home"
  | "settings"
  | "heart"
  | "star"
  | "user"
  | "mail"
  | "plus"
  | "sun"
  | "moon"
type IconComp = ComponentType<{ className?: string }>

export const iconLibraries: { id: IconLib; label: string }[] = [
  { id: "phosphor", label: "Phosphor" },
  { id: "lucide", label: "Lucide" },
  { id: "react-icons", label: "React Icons" },
  { id: "remix", label: "Remix" },
]

function LuGithub({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
    </svg>
  )
}

const ICONS: Record<IconLib, Record<IconName, IconComp>> = {
  lucide: {
    code: LuCode,
    search: LuSearch,
    github: LuGithub,
    copy: LuCopy,
    check: LuCheck,
    close: LuX,
    sidebar: LuSidebar,
    bell: LuBell,
    home: LuHome,
    settings: LuSettings,
    heart: LuHeart,
    star: LuStar,
    user: LuUser,
    mail: LuMail,
    plus: LuPlus,
    sun: LuSun,
    moon: LuMoon,
  },
  "react-icons": {
    code: FiCode,
    search: FiSearch,
    github: FiGithub,
    copy: FiCopy,
    check: FiCheck,
    close: FiX,
    sidebar: FiSidebar,
    bell: FiBell,
    home: FiHome,
    settings: FiSettings,
    heart: FiHeart,
    star: FiStar,
    user: FiUser,
    mail: FiMail,
    plus: FiPlus,
    sun: FiSun,
    moon: FiMoon,
  },
  phosphor: {
    code: PhCode,
    search: PhSearch,
    github: PhGithub,
    copy: PhCopy,
    check: PhCheck,
    close: PhX,
    sidebar: PhSidebar,
    bell: PhBell,
    home: PhHome,
    settings: PhSettings,
    heart: PhHeart,
    star: PhStar,
    user: PhUser,
    mail: PhMail,
    plus: PhPlus,
    sun: PhSun,
    moon: PhMoon,
  },
  remix: {
    code: RiCodeLine,
    search: RiSearchLine,
    github: RiGithubLine,
    copy: RiFileCopyLine,
    check: RiCheckLine,
    close: RiCloseLine,
    sidebar: RiLayoutLeftLine,
    bell: RiNotification2Line,
    home: RiHome2Line,
    settings: RiSettings3Line,
    heart: RiHeartLine,
    star: RiStarLine,
    user: RiUserLine,
    mail: RiMailLine,
    plus: RiAddLine,
    sun: RiSunLine,
    moon: RiMoonLine,
  },
}

interface IconContextValue {
  lib: IconLib
  setLib: (lib: IconLib) => void
  icons: Record<IconName, IconComp>
}

const IconContext = createContext<IconContextValue | null>(null)
const STORAGE_KEY = "better-icon-lib"
const DEFAULT_LIB: IconLib = "phosphor"

export function IconLibraryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [lib, setLibState] = useState<IconLib>(DEFAULT_LIB)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as IconLib | null
    // Intentional post-hydration read: localStorage is client-only, and the
    // server must render the default library to avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved && saved in ICONS) setLibState(saved)
  }, [])

  function setLib(next: IconLib) {
    setLibState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <IconContext.Provider value={{ lib, setLib, icons: ICONS[lib] }}>
      {children}
    </IconContext.Provider>
  )
}

export function useIcons() {
  const ctx = useContext(IconContext)
  if (!ctx) throw new Error("useIcons must be used within IconLibraryProvider")
  return ctx
}
