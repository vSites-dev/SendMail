"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import DotPattern from "./dot-pattern"

const alertVariants = {
  info: {
    bgColor: "bg-gradient-to-r from-blue-50 to-blue-100/80 dark:from-blue-950 dark:to-blue-900",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-300",
    shadowColor: "shadow-blue-100 dark:shadow-blue-900",
    topSeparator: "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-blue-200 dark:before:bg-blue-700",
    bottomSeparator: "after:absolute after:inset-x-0 after:top-[1px] after:h-px after:bg-blue-100 dark:after:bg-blue-800",
    dotColor: "fill-blue-400/30"
  },
  warning: {
    bgColor: "bg-gradient-to-r from-amber-50 to-amber-100/80 dark:from-amber-950 dark:to-amber-900",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    textColor: "text-yellow-700 dark:text-yellow-300",
    shadowColor: "shadow-yellow-100 dark:shadow-yellow-900",
    topSeparator: "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-yellow-200 dark:before:bg-yellow-700",
    bottomSeparator: "after:absolute after:inset-x-0 after:top-[1px] after:h-px after:bg-yellow-100 dark:after:bg-yellow-800",
    dotColor: "fill-yellow-400/30"
  },
  destructive: {
    bgColor: "bg-gradient-to-r from-red-50 to-red-100/80 dark:from-red-950 dark:to-red-900",
    borderColor: "border-red-200 dark:border-red-800",
    textColor: "text-red-700 dark:text-red-300",
    shadowColor: "shadow-red-100 dark:shadow-red-900",
    topSeparator: "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-red-200 dark:before:bg-red-700",
    bottomSeparator: "after:absolute after:inset-x-0 after:top-[1px] after:h-px after:bg-red-100 dark:after:bg-red-800",
    dotColor: "fill-red-400/30"
  },
  success: {
    bgColor: "bg-gradient-to-r from-emerald-50 to-emerald-100/80 dark:from-emerald-950 dark:to-emerald-900",
    borderColor: "border-green-200 dark:border-green-800",
    textColor: "text-green-700 dark:text-green-300",
    shadowColor: "shadow-green-100 dark:shadow-green-900",
    topSeparator: "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-green-200 dark:before:bg-green-700",
    bottomSeparator: "after:absolute after:inset-x-0 after:top-[1px] after:h-px after:bg-green-100 dark:after:bg-green-800",
    dotColor: "fill-green-400/30"
  },
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type: keyof typeof alertVariants
  cta?: React.ReactNode
  title?: string
  icon?: React.ReactNode
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, type, title, icon, cta, children, ...props }, ref) => {
    const { bgColor, borderColor, textColor, shadowColor } = alertVariants[type]

    return (
      <div
        ref={ref}
        className={cn(
          "relative border rounded-md overflow-hidden",
          bgColor,
          textColor,
          borderColor,
          className
        )}
        {...props}
      >
        <div className="z-10 relative">
          {(title || icon) && (
            <div className="flex justify-between items-center gap-2 px-4 py-3">
              <div className="flex items-center gap-2">
                {icon && <span className="p-[6px] bg-background rounded-full border">{icon}</span>}
                {title && <h5 className="text-xl font-semibold">{title}</h5>}
              </div>
              {/* <AlertSeparator className="my-2" type={type} /> */}

              {cta && cta}
            </div>
          )}
          {(children && (title || icon)) ?
            <div className={cn("text-base px-4 pb-3", className)}>{children}</div>
            : children}
        </div>

        <div
          className={cn(
            "absolute bottom-0 right-0 h-[400px] w-[400px]",
            "[mask-image:radial-gradient(500px_circle_at_bottom_right,white,transparent)]",
          )}
        >
          <DotPattern
            width={6}
            height={6}
            cx={2}
            cy={2}
            cr={2}
            className={cn(alertVariants[type].dotColor, "opacity-50")}
          />
        </div>
      </div>
    )
  }
)
Alert.displayName = "Alert"

const AlertSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { type: keyof typeof alertVariants }
>(({ className, type, ...props }, ref) => {
  const { topSeparator, bottomSeparator } = alertVariants[type]

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-[2px] mb-3 mt-1 w-full",
        "after:absolute after:inset-0 after:rounded-md",
        "before:absolute before:inset-0 before:rounded-md",
        topSeparator,
        bottomSeparator,
        className
      )}
      {...props}
    />
  )
})
AlertSeparator.displayName = "AlertSeparator"

export { Alert, AlertSeparator }

