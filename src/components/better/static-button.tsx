import { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const staticButton = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium leading-none tracking-[-0.01em] outline-none transition-[background-color,color,transform,box-shadow] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#0071e3]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        // Apple's signature blue "Buy" pill.
        primary:
          "bg-[#0071e3] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:bg-[#0077ed]",
        // The quiet "Learn more" link-pill.
        secondary:
          "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed] dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
        // Outlined variant for use over imagery.
        outline:
          "border border-[#0071e3] bg-transparent text-[#0071e3] hover:bg-[#0071e3] hover:text-white",
        ghost:
          "bg-transparent text-[#0071e3] hover:bg-[#0071e3]/10 dark:text-[#2997ff] dark:hover:bg-[#2997ff]/10",
      },
      size: {
        sm: "px-4 py-2 text-[13px]",
        md: "px-[17px] py-2.5 text-[15px]",
        lg: "px-6 py-3 text-[17px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface StaticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof staticButton> {}

/**
 * StaticButton — a clean, Apple-style pill button. No motion library, just CSS
 * transitions: a subtle color shift on hover and a press-in on tap.
 * Category: UI. Part of the Better Component library.
 */
export const StaticButton = forwardRef<HTMLButtonElement, StaticButtonProps>(
  function StaticButton({ className, variant, size, type, ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(staticButton({ variant, size }), className)}
        {...props}
      />
    )
  }
)
