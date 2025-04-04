"use client";

import { selectedIntervalAtom } from "@/store/global";
import { useAtom } from "jotai";
import KpiCard from "./kpi-card";
import { api } from "@/trpc/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export default function MainStats() {
  const [timeInterval, setTimeInterval] = useAtom(selectedIntervalAtom);

  const { data: campaignCount, isFetching: campaignCountFetching } =
    api.campaign.scheduledCampaignsCount.useQuery(
      {
        timeInterval,
      },
      {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    );
  const {
    data: emailCount,
    isFetching: emailCountFetching,
  } = api.email.emailCount.useQuery(
    {
      timeInterval,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const { data: clickCount, isFetching: clickCountFetching } =
    api.email.clickCount.useQuery(
      {
        timeInterval,
      },
      {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    );

  const kpiData = useMemo(() => {
    return [
      {
        title: "Kampányok száma",
        value: campaignCount?.value,
        previousValue: campaignCount?.previousValue,
        type: "campaigns",
        loading: campaignCountFetching,
      },
      {
        title: "Emailek száma",
        value: emailCount?.value,
        previousValue: emailCount?.previousValue,
        type: "emails",
        loading: emailCountFetching,
      },
      {
        title: "Kattintások száma",
        value: clickCount?.value,
        previousValue: clickCount?.previousValue,
        type: "clicks",
        loading: clickCountFetching,
      },
    ];
  }, [
    campaignCount,
    emailCount,
    clickCount,
    campaignCountFetching,
    emailCountFetching,
    clickCountFetching,
  ]);

  return (
    <div className="z-10 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {kpiData.map((kpi) => (
        <div className={cn(kpi.type === "clicks" && "col-span-1 lg:col-span-2 xl:col-span-1")} key={kpi.title}>
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value || 0}
            previousValue={kpi.previousValue || 0}
            type={kpi.type as "campaigns" | "emails" | "clicks"}
            loading={kpi.loading}
          />
        </div>
      ))}
    </div>
  );
}
