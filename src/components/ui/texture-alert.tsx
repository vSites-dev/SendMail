import * as React from "react";
import { cn } from "@/lib/utils";
import DotPattern from "./dot-pattern";

interface AlertCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'error' | 'success';
  children?: React.ReactNode;
}

const AlertCard = React.forwardRef<HTMLDivElement, AlertCardProps>(
  ({ className, variant = 'info', children, ...props }, ref) => {
    const variants = {
      info: {
        bg: "bg-gradient-to-r from-blue-50 to-blue-100/80",
        exterior: "shadow-[0_0_10px_0_rgba(0,0,255,0.1)] outline-blue-200/40 ",
        border: "border-blue-900/20",
        content: "border-blue-400/50 bg-gradient-to-r from-blue-50 to-transparent text-blue-700",
        dotColor: "fill-blue-400/30"
      },
      warning: {
        bg: "bg-gradient-to-r from-amber-50 to-amber-100/80",
        exterior: "shadow-[0_0_10px_0_rgba(255,255,0,0.1)]  outline-amber-200/40",
        border: "border-amber-900/20",
        content: "border-amber-400/50 bg-gradient-to-r from-amber-50 to-transparent text-amber-700",
        dotColor: "fill-amber-400/30"
      },
      error: {
        bg: "bg-gradient-to-r from-red-50 to-red-100/80",
        exterior: "shadow-[0_0_10px_0_rgba(255,0,0,0.1)] outline-red-200/40",
        border: "border-red-900/20",
        content: "border-red-400/50 bg-gradient-to-r from-red-50 to-transparent text-red-600",
        dotColor: "fill-red-400/30"
      },
      success: {
        bg: "bg-gradient-to-r from-emerald-50 to-emerald-100/80",
        exterior: "shadow-[0_0_10px_0_rgba(0,255,0,0.1)] outline-emerald-200/40",
        border: "border-emerald-900/20",
        content: "border-emerald-400/50 bg-gradient-to-r from-emerald-50 to-transparent text-emerald-700",
        dotColor: "fill-emerald-400/30"
      },
    };

    return (
      <div
        ref={ref}
        className={cn(
          className
        )}
        {...props}
      >
        <div className={cn("rounded-[10px] outline outline-2 outline-offset-1", variants[variant].exterior)}>
          <div className={cn(
            "w-full rounded-[10px] border p-4 relative overflow-hidden",
            variants[variant].content,
            variants[variant].bg)}>
            <div className="z-10 relative">
              {children}
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
                className={cn(variants[variant].dotColor, "opacity-40")}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AlertCard.displayName = "AlertCard";

export { AlertCard };