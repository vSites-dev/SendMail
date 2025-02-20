"use client";

import { selectedIntervalAtom } from "@/store/global";
import { useAtom } from "jotai";
import KpiCard from "./kpi-card";
import { api } from "@/trpc/react";
import { useEffect, useMemo } from "react";

const kpiData = [
  {
    title: "Elküldött emailek száma",
    value: "484",
    previousValue: "400",
    type: "sent",
    loading: false,
  },
  {
    title: "Megnyitott emailek száma",
    value: "263",
    previousValue: "203",
    type: "opens",
    loading: false,
  },
  {
    title: "Kattintások száma",
    value: "30",
    previousValue: "0",
    type: "clicks",
    loading: false,
  },
]

export default function MainStats() {
  const [timeInterval, setTimeInterval] = useAtom(selectedIntervalAtom);

  return (
    <div className="z-10 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {kpiData.map((kpi) => (
        <KpiCard
          key={kpi.title}
          title={kpi.title}
          value={parseFloat(kpi.value) || 0}
          previousValue={parseFloat(kpi.previousValue) || 0}
          type={kpi.type as any}
          loading={kpi.loading}
        />
      ))}
    </div>
  );
}
