"use client";

import { Card, CardFooter, CardSeparator } from "@/components/ui/card";
import {
  Eye,
  MessageSquare,
  FolderOpen,
  MessageSquareMore,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  TrendingUp,
  MousePointerClick,
  Minus,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/ui/number-ticker";

interface KpiCardProps {
  title: string;
  value: number;
  previousValue: number;
  type: "sent" | "opens" | "clicks";
  className?: string;
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
}

const KpiCard = ({
  title,
  value,
  previousValue,
  type,
  className,
}: KpiCardProps) => {
  const percentageChange = previousValue === 0
    ? value > 0 ? 100 : 0
    : ((value - previousValue) / previousValue) * 100;
  const isPositive = percentageChange > 0;

  const Icon = icons[type];

  return (
    <Card className={cn("", className)}>
      <div className="p-6 pb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className={cn("flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border", iconColorByType[type])}>
              <Icon className="size-5" />
            </div>

            <h3 className="text-base font-medium">
              {title}
            </h3>
          </div>
          <p className="text-3xl mt-3 font-bold">
            <NumberTicker
              value={value}
              className="text-3xl font-mono tracking-tight font-semibold"
            />

            <span className="text-xs ml-2 font-medium text-muted-foreground">
              vs.
            </span>

            {previousValue === 0 ? (
              <span className="text-base font-mono font-medium tracking-tight text-muted-foreground opacity-80 ml-1">0</span>
            ) : (
              <NumberTicker
                value={previousValue}
                className="text-base font-mono font-medium tracking-tight text-muted-foreground opacity-80 ml-1"
              />
            )}
          </p>
        </div>
      </div>

      <CardSeparator />

      <div className="bg-stone-50 rounded-b-2xl px-6 py-3">
        <div className="flex z-10 items-start sm:items-center sm:flex-row gap-2 flex-col">
          <div
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs f0-medium",
              value === previousValue ? "bg-gray-100 text-gray-800" :
                isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
            )}
          >
            {value === previousValue ? (
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
            előző hónaphoz képest
          </span>
        </div>
      </div>
    </Card>
  );
};

export default KpiCard;
