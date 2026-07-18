import Link from "next/link"

import { cn } from "@/lib/utils"

/**
 * A link whose underline wipes in from the left over 2s. The rule is a real
 * element rather than text-decoration so it can be scaled; scaleX animates on
 * the compositor, where `width` would relayout every frame.
 */
export function UnderlineLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn("group relative inline-block leading-none", className)}
    >
      {children}
      <span
        aria-hidden
        className="absolute -bottom-[0.12em] left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-[2000ms] ease-out group-hover:scale-x-100"
      />
    </Link>
  )
}
