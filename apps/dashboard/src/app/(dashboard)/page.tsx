import { api, HydrateClient } from "@/trpc/server";
import {
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import DashboardHeader from "@/components/layouts/dashboard-header";
import { EmailsLineChart } from "@/components/dashboard/emails-line-chart";
import IntervalSelect from "@/components/dashboard/interval-select";
import MainStats from "@/components/dashboard/main-stats";
import { Home } from "lucide-react";
import Link from "next/link";



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
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold text-neutral-700">
            Fő statisztikák
          </h1>

          <IntervalSelect />
        </div>

        <MainStats />

        <EmailsLineChart />
      </main>
    </HydrateClient>
  );
}
