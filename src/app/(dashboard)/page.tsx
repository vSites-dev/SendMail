import { api, HydrateClient } from "@/trpc/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import DashboardHeader from "@/components/layouts/dashboard-header";
import KpiCard from "@/components/stats/kpi-card";
import { EmailsLineChart } from "@/components/stats/emails-line-chart";

const kpiData = [
  {
    title: "Elküldött emailek száma",
    value: 484,
    previousValue: 400,
    type: "sent",
  },
  {
    title: "Megnyitott emailek száma",
    value: 263,
    previousValue: 203,
    type: "opens",
  },
  {
    title: "Kattintások száma",
    value: 30,
    previousValue: 0,
    type: "clicks",
  }
]

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });

  // will prefetch the data for events and messages linechart
  // void api.stats.eventsAndMessages.prefetch({  interval: 7 });

  return (
    <HydrateClient>
      <DashboardHeader>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Vezérlőpult</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </DashboardHeader>

      <main className="flex flex-col py-8 px-4 md:px-8 relative mx-auto space-y-6 container">
        <div className="z-10 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {kpiData.map((kpi) => (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              previousValue={kpi.previousValue}
              type={kpi.type as any}
            />
          ))}
        </div>

        <EmailsLineChart />
      </main>
    </HydrateClient>
  );
}
