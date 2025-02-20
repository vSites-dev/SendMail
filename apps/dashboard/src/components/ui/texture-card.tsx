import * as React from "react";

import { cn } from "@/lib/utils";

const CardStyled = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => (

  <div
    ref={ref}
    className={cn(
      "rounded-[24px] border border-white/60 dark:border-stone-950/60",
      "bg-white dark:from-neutral-800 dark:to-neutral-900",
      className)}
    {...props}
  >
    {/* Nested structure for aesthetic borders */}
    <div className="rounded-[27px] border-[6px] border-black/5 dark:border-neutral-900/80">
      <div className="rounded-[21px] border border-neutral-950/25 outline outline-[2px] outline-black/5 dark:border-neutral-900/70">
        {/* Inner content wrapper */}
        <div className="w-full rounded-[20px] border border-white/50 text-neutral-500 dark:border-neutral-700/50">
          {children}
        </div>
      </div>
    </div>
  </div>
));

// Allows for global css overrides and theme support - similar to shad cn
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-white/60 dark:border-border/30",
        "rounded-[calc(var(--radius))]", // Base radius with fallback
        className,
      )}
      {...props}
    >
      <div className="rounded-[calc(var(--radius))] border-[4px] border-black/5 dark:border-neutral-900/80">
        <div className="rounded-[calc(var(--radius)-2px)] border border-white/50 dark:border-neutral-950">
          <div className="rounded-[calc(var(--radius)-3px)] border border-neutral-950/25 outline outline-[2px] outline-black/5 dark:border-neutral-900/70">
            <div className="w-full rounded-[calc(var(--radius)-4px)] border border-white/50 text-neutral-500 dark:border-neutral-700/5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col p-6", // Adjust padding for first and last child
      className,
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-tight text-neutral-800 dark:text-neutral-100",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "!mt-2 text-[15px] text-muted-foreground dark:text-neutral-400",
      className,
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between gap-2 px-6 py-4",

      className,
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

const CardSeparator = () => {
  return (
    <div className="border border-b-neutral-300/50 border-l-transparent border-r-transparent border-t-neutral-50 dark:border-b-neutral-700/50 dark:border-t-neutral-950" />
  );
};

export {
  Card,
  CardHeader,
  CardStyled,
  CardFooter,
  CardTitle,
  CardSeparator,
  CardDescription,
  CardContent,
};

export default Card;
