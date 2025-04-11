"use client";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Skeleton } from "./skeleton";

const roleConfig = {
  MEMBER: {
    label: "Marketinges",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  ADMIN: {
    label: "Adminisztrátor",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  OWNER: {
    label: "Tulajdonos",
    className: "bg-green-100 text-green-800 border-green-200",
  },
} as const;

export default function RoleIndicator() {
  const { data: role } = api.project.checkUsersRole.useQuery();
  if (!role) return <Skeleton className="w-20 h-4" />;

  const config = roleConfig[role];

  return (
    <div
      className={cn(
        "inline-flex w-fit items-center px-2 rounded-full text-xs tracking-tight border",
        config.className,
      )}
    >
      {config.label}
    </div>
  );
}
