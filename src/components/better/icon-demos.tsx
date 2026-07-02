"use client"

import { useIcons } from "@/components/site/icons"
import { IconTooltip } from "@/components/better/icon-tooltip"
import { NotificationCard } from "@/components/better/notification-card"
import { IconWheel } from "@/components/better/icon-wheel"

/**
 * Demo wrappers that feed icons from the currently-selected icon library into
 * each component, so switching libraries visibly changes the rendered icons.
 */

export function IconTooltipDemo() {
  const { icons } = useIcons()
  return (
    <IconTooltip icon={<icons.settings className="size-5" />} label="Settings" />
  )
}

export function NotificationDemo() {
  const { icons } = useIcons()
  return (
    <NotificationCard
      icon={<icons.bell className="size-4" />}
      title="New notification"
      message="Someone starred your component."
      closeIcon={<icons.close className="size-4" />}
    />
  )
}

function useWheelItems() {
  const { icons } = useIcons()
  return [
    { Icon: icons.home, label: "Home" },
    { Icon: icons.user, label: "User" },
    { Icon: icons.bell, label: "Bell" },
    { Icon: icons.heart, label: "Heart" },
    { Icon: icons.settings, label: "Settings" },
    { Icon: icons.search, label: "Search" },
  ]
}

export function IconWheelDemo() {
  const items = useWheelItems()
  return (
    <IconWheel
      radius={120}
      items={items.map(({ Icon, label }) => ({
        icon: <Icon className="size-5" />,
        label,
      }))}
    />
  )
}

/** Compact static-ish wheel for the gallery card. */
export function IconWheelPoster() {
  const items = useWheelItems()
  return (
    <IconWheel
      radius={64}
      items={items.map(({ Icon, label }) => ({
        icon: <Icon className="size-3.5" />,
        label,
      }))}
    />
  )
}
