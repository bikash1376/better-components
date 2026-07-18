import { Figtree, Newsreader } from "next/font/google"

/** Only used inside /design-exploration, so they load with these routes. */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["200"],
  style: ["normal", "italic"],
})

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
})

export default function DesignExplorationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${newsreader.variable} ${figtree.variable} contents`}>
      {children}
    </div>
  )
}
