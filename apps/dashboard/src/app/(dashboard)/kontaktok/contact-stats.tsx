"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type ContactStatus } from "@prisma/client";
import { motion } from "framer-motion";
import {
  CheckCircle,
  AlertCircle,
  Ban,
  UserCheck,
} from "lucide-react";

const statusConfig: Record<
  ContactStatus,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    label: string;
    cssVar: string;
  }
> = {
  SUBSCRIBED: {
    icon: UserCheck,
    color: "text-green-500",
    bgColor: "bg-green-50",
    label: "Feliratkozott",
    cssVar: "--contact-subscribed",
  },
  UNSUBSCRIBED: {
    icon: Ban,
    color: "text-red-500",
    bgColor: "bg-red-50",
    label: "Leiratkozott",
    cssVar: "--contact-unsubscribed",
  },
  BOUNCED: {
    icon: AlertCircle,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    label: "Visszapattant",
    cssVar: "--contact-bounced",
  },
  COMPLAINED: {
    icon: Ban,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    label: "Panaszolt",
    cssVar: "--contact-complained",
  },
};

interface ContactStatCardProps {
  status: ContactStatus;
  count: number;
  total: number;
  className?: string;
}

export function ContactStatCard({
  status,
  count,
  total,
  className,
}: ContactStatCardProps) {
  const config = statusConfig[status];
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.1 * Object.keys(statusConfig).indexOf(status)
      }
    }
  };

  const chartVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.2 + 0.1 * Object.keys(statusConfig).indexOf(status),
        duration: 0.5,
        type: "spring",
        stiffness: 200
      }
    }
  };

  const countVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.3 + 0.1 * Object.keys(statusConfig).indexOf(status),
        duration: 0.3
      }
    }
  };

  const Icon = config.icon;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("w-full", className)}
    >
      <Card className="p-4 h-full flex flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={cn(
                "flex relative p-[5px] items-center justify-center rounded-md text-2xl font-semibold border",
                config.bgColor,
                config.color
              )}
            >
              <Icon className="size-5" />
            </div>
            <h3 className="text-base font-medium">{config.label}</h3>
          </div>

          <motion.div
            variants={countVariants}
            className="text-3xl mt-1"
          >
            {count}
            <span className="text-sm ml-2 text-muted-foreground">
              kontakt
            </span>
          </motion.div>
        </div>

        <motion.div
          variants={chartVariants}
          className="relative w-20 h-20 flex items-center justify-center"
        >
          {/* Background circle */}
          <div className="absolute inset-0 rounded-full bg-gray-50"></div>

          {/* Animated progress circle */}
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={`hsl(var(${config.cssVar}))`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.51} 251`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
              initial={{ strokeDasharray: "0 251" }}
              animate={{ strokeDasharray: `${percentage * 2.51} 251` }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            />
          </svg>

          {/* Percentage text */}
          <div className={cn("relative text-sm font-bold", config.color)}>
            {percentage}%
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}

interface ContactStatsProps {
  statistics: Record<ContactStatus, number>;
  total: number;
}

export default function ContactStats({ statistics, total }: ContactStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Object.entries(statistics).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
        <ContactStatCard
          key={status}
          status={status as ContactStatus}
          count={count}
          total={total}
        />
      ))}
    </div>
  );
}
