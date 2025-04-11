"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardSeparator,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquareMore,
  BarChartBig,
  Mails,
  MousePointerClick,
} from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import DotPattern from "../ui/dot-pattern";
import { useAtom } from "jotai";
import { selectedIntervalAtom } from "@/store/global";
import { api } from "@/trpc/react";
import { Skeleton } from "../ui/skeleton";

const chartConfig = {
  emails: {
    label: "Emailek",
    color: "hsl(var(--chart-2))",
  },
  clicks: {
    label: "Kattintások",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

// const generateDummyData = (days: number): any[] => {
//   const data: any[] = [];
//   const endDate = new Date();

//   for (let i = days; i >= 0; i--) {
//     const date = new Date();
//     date.setDate(endDate.getDate() - i);
//     data.push({
//       date: date.toLocaleDateString("hu-HU"),
//       emails: Math.floor(Math.random() * 100) + 20,
//       clicks: Math.floor(Math.random() * 50) + 10,
//     });
//   }
//   return data;
// };

export function EmailsAndClicksChart({
  initialData,
}: {
  initialData?: {
    date: string;
    emails: number;
    clicks: number;
  }[];
}) {
  const [selectedInterval] = useAtom(selectedIntervalAtom);
  const { data: chartData, isFetching } =
    api.email.emailsAndClicksChartData.useQuery(
      {
        timeInterval: selectedInterval,
      },
      {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        initialData: initialData,
      },
    );

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="flex relative size-10 items-center justify-center rounded-xl bg-neutral-50 text-[#2a9d90] text-2xl font-semibold border">
              <Mails />
            </div>
            <div className="space-y-1">
              <CardTitle className="font-normal text-xl">
                <b className="font-bold tracking-wide text-neutral-800">
                  Emailek és Kattintások
                </b>{" "}
                az elmúlt {selectedInterval} napban
              </CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardSeparator />
      <CardContent className="overflow-hidden p-0 z-10">
        {isFetching ? (
          <div className="p-6">
            <Skeleton className="h-[250px] w-full" />
          </div>
        ) : chartData?.length === 0 ||
          chartData?.every((x) => x.emails === 0 && x.clicks === 0) ? (
          <div className="relative h-[250px] overflow-hidden w-full">
            <DotPattern
              width={6}
              height={6}
              cx={1}
              cy={1}
              cr={1}
              className="opacity-20"
            />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
              <BarChartBig className="mb-2 size-8 text-muted-foreground" />
              <p className="text-base text-neutral-700 font-semibold">
                Nincs megjeleníthető adat
              </p>
              <p className="text-xs max-w-[250px] mt-2 text-center text-muted-foreground opacity-80">
                Ha úgy gondolod, hogy probléma akadt akkor keress fel minket a
                support@leoai.hu címen.
              </p>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full -ml-8 p-4"
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 10,
                right: 10,
              }}
              className="z-10"
            >
              <CartesianGrid vertical={false} horizontal={true} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelKey="date"
                    indicator="dot"
                    formatter={(value, name, payload, index) => (
                      <div>
                        {name === "emails" && (
                          <>
                            <div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  payload.payload.date,
                                ).toLocaleDateString("hu-HU")}
                              </span>
                            </div>
                            <div className="border-[#2a9d90] border-l-2 pl-2 rounded-[2px] mt-1">
                              <span className="font-bold text-lg mr-1">
                                {payload?.value}
                              </span>
                              <span className="text-base text-muted-foreground">
                                elküldött email
                              </span>
                            </div>
                          </>
                        )}
                        {name === "clicks" && (
                          <div className="border-[#6366f1] border-l-2 pl-2 rounded-[2px]">
                            <span className="font-bold text-lg mr-1">
                              {payload?.value}
                            </span>
                            <span className="text-base text-muted-foreground">
                              kattintás
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  />
                }
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value: string) => value}
                padding={{ left: 0, right: 0 }}
                letterSpacing={-0.2}
                fontWeight={500}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                letterSpacing={-0.2}
                fontWeight={500}
                padding={{ top: 20, bottom: 0 }}
                tickFormatter={(value) => value.toLocaleString("hu-HU")}
              />
              <Line
                dataKey="emails"
                type="natural"
                stroke="#2a9d90"
                strokeWidth={2}
                dot={false}
                name="emails"
              />
              <Line
                dataKey="clicks"
                type="natural"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                name="clicks"
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => {
                  return value === "emails" ? "Emailek" : "Kattintások";
                }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
