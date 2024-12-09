"use client"

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-violet-700/80 to-violet-800 text-primary-foreground !shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] drop-shadow-md border border-gray-200/20 relative overflow-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary/30 !text-white",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-white shadow-sm hover:bg-accent hover:text-accent-foreground",
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
  (props, ref) => {
    return (
      <AnimatedButton
        ref={ref}
        {...(props as any)}
        whileHover="hover"
        whileFocus="tap"
        whileTap="tap"
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
        {props.children}
      </AnimatedButton>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
