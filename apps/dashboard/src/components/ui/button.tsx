
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden relative",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-violet-700/80 to-violet-800 text-primary-foreground !shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] drop-shadow-md border border-neutral-950/25 relative overflow-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary/30 !text-white",
        destructive:
          "bg-gradient-to-b from-red-600 to-red-800 text-destructive-foreground !shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] drop-shadow-md border border-red-200/10 relative overflow-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-destructive/30 !text-white font-semibold",
        success:
          "bg-gradient-to-b from-green-600 to-green-800 text-primary-foreground !shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] drop-shadow-md border border-green-200/10 relative overflow-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-green-500/30 !text-white",
        outline:
          "border border-neutral-950/25 bg-white shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const AnimatedButton = motion.create(
  React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
      const Comp = asChild ? Slot : "button";
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    },
  ),
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ isLoading, children, asChild, ...props }, ref) => {
    // If using asChild with isLoading, we need to handle it differently
    // to avoid the React.Children.only error
    if (asChild && isLoading) {
      // When both asChild and isLoading are true, we need to modify how we render
      // We'll use the AnimatedButton without the asChild prop and handle the slot differently
      return (
        <AnimatedButton
          ref={ref}
          disabled={isLoading || props.disabled}
          {...(props as any)}
          asChild={false} // Force this to false to avoid the Slot component
          whileHover={undefined}
          whileFocus={undefined}
          whileTap={undefined}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"
            initial={{ opacity: 0, height: "0%" }}
          />
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {children}
        </AnimatedButton>
      );
    }

    // Normal rendering when not both asChild and isLoading
    return (
      <AnimatedButton
        ref={ref}
        disabled={isLoading || props.disabled}
        {...(props as any)}
        whileHover={!isLoading ? "hover" : undefined}
        whileFocus={!isLoading ? "tap" : undefined}
        whileTap={!isLoading ? "tap" : undefined}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"
          initial={{ opacity: 0, height: "0%" }}
          variants={{
            hover: {
              opacity: 0.4,
              height: "30%",
              transition: { duration: 0.3 },
            },
            tap: {
              opacity: 0.6,
              height: "50%",
              transition: { duration: 0.3 },
            },
          }}
        />
        {isLoading ? (
          <>
            {children}
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          </>
        ) : (
          children
        )}
      </AnimatedButton>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
