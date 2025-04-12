"use client";

import { Button } from "@/components/ui/button";
import { Organization } from "@/lib/auth/auth";
import useScroll from "@/lib/use-scroll";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface Step {
  name: string;
  href: string;
}

const steps: Step[] = [
  { name: "Első lépés", href: "/uj-projekt/1" },
  { name: "Második lépés", href: "/uj-projekt/2" },
];

interface StepProgressProps {
  steps: Step[];
}

const StepProgress = ({ steps }: StepProgressProps) => {
  const pathname = usePathname();
  const currentStepIndex = steps.findIndex((step) =>
    pathname.startsWith(step.href),
  );

  return (
    <div aria-label="Onboarding folyamat">
      <ol className="mx-auto flex w-24 flex-nowrap gap-1 md:w-fit">
        {steps.map((step, index) => (
          <li
            key={step.name}
            className={cn(
              "h-1 w-12 rounded-full",
              index <= currentStepIndex
                ? "bg-violet-500"
                : "bg-gray-300 dark:bg-gray-700",
            )}
          >
            <span className="sr-only">
              {step.name}{" "}
              {index < currentStepIndex
                ? "completed"
                : index === currentStepIndex
                  ? "current"
                  : ""}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

const Wrapper = ({
  children,
  organizations,
}: Readonly<{
  children: React.ReactNode;
  organizations: Organization[];
}>) => {
  const scrolled = useScroll(15);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 isolate z-50 flex items-center justify-between border-b bg-white border-gray-200 px-4 transition-all md:grid md:grid-cols-[200px_auto_200px] md:px-6 dark:border-gray-900 dark:bg-gray-925",
          scrolled ? "h-12" : "h-20",
        )}
      >
        <Image
          src="/brand/logo.svg"
          alt="logo"
          width={120}
          height={46}
          quality={100}
        />
        <StepProgress steps={steps} />
        <Button asChild variant={"link"}>
          <Link href={"/"}>Vissza vezérlőpultra</Link>
        </Button>
      </header>
      <main id="main-content" className="mx-auto mb-20 mt-28 max-w-lg">
        {children}
      </main>
    </>
  );
};

export default Wrapper;
