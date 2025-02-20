"use client";

import { Card, CardSeparator } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  FolderOpen,
  TrendingDown,
  TrendingUp,
  MousePointerClick,
  Minus,
  Sigma,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/ui/number-ticker";
import { useAtom } from "jotai";
import { selectedIntervalAtom } from "@/store/global";
import { useEffect, useState } from "react";

interface KpiCardProps {
  title: string;
  value: number;
  previousValue: number;
  type: "sent" | "opens" | "clicks";
  className?: string;
  loading?: boolean;
}

const icons = {
  sent: Mail,
  opens: FolderOpen,
  clicks: MousePointerClick,
};

const iconColorByType = {
  sent: "text-blue-500",
  opens: "text-green-500",
  clicks: "text-yellow-500",
};

const KpiCard = ({
  title,
  value,
  previousValue,
  type,
  className,
  loading = false,
}: KpiCardProps) => {
  const [timeInterval, setTimeInterval] = useAtom(selectedIntervalAtom);

  const percentageChange =
    previousValue === 0 ? 0 : ((value - previousValue) / previousValue) * 100;
  const isPositive = percentageChange > 0;

  const Icon = icons[type];

  return (
    <Card className={cn("", className)}>
      <div className="p-6 pb-4 flex items-start justify-between">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border",
                    iconColorByType[type],
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="text-base font-medium">{title}</h3>
              </div>
              <Skeleton className="h-8 w-48 mt-4" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border",
                    iconColorByType[type],
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="text-base font-medium">{title}</h3>
              </div>
              <p className="text-3xl mt-3 font-bold">
                <NumberTicker
                  value={value}
                  decimalPlaces={Number.isInteger(value) ? 0 : 2}
                  className="text-3xl font-mono tracking-tight font-semibold"
                />
                <span className="text-xs ml-2 font-medium text-muted-foreground">
                  vs.
                </span>

                {previousValue === 0 ? (
                  <span className="text-base font-mono font-medium tracking-tight text-muted-foreground opacity-80 ml-1">
                    0
                  </span>
                ) : (
                  <NumberTicker
                    value={previousValue}
                    decimalPlaces={Number.isInteger(previousValue) ? 0 : 2}
                    className="text-base font-mono font-medium tracking-tight text-muted-foreground opacity-80 ml-1"
                  />
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CardSeparator />

      <div className="bg-stone-50 rounded-b-2xl px-6 py-3">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-5 w-32" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex z-10 items-start sm:items-center sm:flex-row gap-2 flex-col"
            >
              <div
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs f0-medium",
                  value === previousValue || previousValue === 0
                    ? "bg-gray-100 text-gray-800"
                    : isPositive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800",
                )}
              >
                {value === previousValue || previousValue === 0 ? (
                  <Minus className="size-4" />
                ) : isPositive ? (
                  <TrendingUp className="size-4" />
                ) : (
                  <TrendingDown className="size-4" />
                )}
                {value !== previousValue && (isPositive ? "+" : "")}
                {percentageChange.toFixed(1)}%
              </div>

              <span className="text-sm text-muted-foreground">
                előző {timeInterval} naphoz képest
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default KpiCard;
