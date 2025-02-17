"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardSeparator,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, MessageSquareMore, BarChartBig, Mails } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import DotPattern from "../ui/dot-pattern";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth/client";

interface EmailsData {
  date: string;
  emails: number;
}

const chartConfig = {
  desktop: {
    label: "Emailek",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const generateDummyData = (days: number): EmailsData[] => {
  const data: EmailsData[] = [];
  const endDate = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(endDate.getDate() - i);
    data.push({
      date: date.toLocaleDateString("hu-HU"),
      emails: Math.floor(Math.random() * 100) + 20,
    });
  }
  return data;
};

export function EmailsLineChart({
  initialEmailsData,
}: {
  initialEmailsData?: {
    date: string;
    emails: number;
  }[];
}) {
  const [timeRange, setTimeRange] = React.useState("7d");
  const [data, setData] = React.useState<EmailsData[]>([]);

  React.useEffect(() => {
    setData(initialEmailsData ?? generateDummyData(30));
  }, []);

  const filteredData = React.useMemo(() => {
    const daysMap: Record<string, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "180d": 180,
      "365d": 365,
    };

    const days = daysMap[timeRange] ?? 7;
    return data.slice(-days);
  }, [timeRange, data]);

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
                <b className="font-bold tracking-wide text-neutral-800">Emailek</b> az elmúlt{" "}
                {timeRange === "365d"
                  ? "évbe"
                  : timeRange.replace("d", " napba")}
              </CardTitle>
            </div>
          </div>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="relative z-10 w-[140px] rounded-lg sm:ml-auto"
            aria-label="Időszak kiválasztása"
          >
            <CalendarDays className="size-4" />
            Intervallum
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="7d">7 nap</SelectItem>
            <SelectItem value="30d">30 nap</SelectItem>
            <SelectItem value="90d">90 nap</SelectItem>
            <SelectItem value="180d">180 nap</SelectItem>
            <SelectItem value="365d">365 nap</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardSeparator />

      <CardContent className="overflow-hidden p-0 z-10">
        {filteredData.length === 0 ? (
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
                Ha úgy gondolod, hogy probléma akadt akkor keress fel minket a support@leoai.hu címen.
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
              data={filteredData}
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
                      <div className="border-[#2a9d90] border-l-2 pl-2 rounded-[3px]">
                        <div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(payload.payload.date).toLocaleDateString(
                              "hu-HU",
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-lg mr-1">
                            {payload?.value}
                          </span>
                          <span className="text-base text-muted-foreground">
                            elküldött email
                          </span>
                        </div>
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
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                padding={{ top: 20, bottom: 0 }}
                tickFormatter={(value) => value.toLocaleString("hu-HU")}
              />

              <Line
                dataKey="emails"
                type="natural"
                stroke="#2a9d90"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}

      </CardContent>
    </Card>
  );
}
