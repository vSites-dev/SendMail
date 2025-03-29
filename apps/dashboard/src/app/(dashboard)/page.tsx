import { api, HydrateClient } from "@/trpc/server";
import {
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import DashboardHeader from "@/components/layouts/dashboard-header";
import { EmailsLineChart } from "@/components/dashboard/emails-line-chart";
import IntervalSelect from "@/components/dashboard/interval-select";
import MainStats from "@/components/dashboard/main-stats";
import { ChartColumnBig, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ActionsPanel from "@/components/dashboard/actions-panel";



export default async function Dashboard() {
  // void api.dashboard.sentEmailCount.prefetch({ timeInterval: 30 });
  // void api.dashboard.openedEmailCount.prefetch({ timeInterval: 30 });
  // void api.dashboard.openedLinkCount.prefetch({ timeInterval: 30 });

  return (
    <HydrateClient>
      <DashboardHeader>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/">
              <Home size={20} strokeWidth={1.6} />
            </Link>
          </BreadcrumbItem>
        </BreadcrumbList>
      </DashboardHeader>

      <main className="flex flex-col py-8 px-4 md:px-8 relative mx-auto space-y-6 container">
        <ActionsPanel />

        <div className="h-4" />

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-3 items-center">
            <div
              className={cn(
                "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border text-neutral-700",
              )}
            >
              <ChartColumnBig className="size-5" />
            </div>

            <h1 className="text-2xl title">Fő statisztikák</h1>
          </div>

          <IntervalSelect />
        </div>

        <MainStats />
        <EmailsLineChart />
      </main>
    </HydrateClient>
  );
}
