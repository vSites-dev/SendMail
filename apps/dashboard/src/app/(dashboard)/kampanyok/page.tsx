import DashboardHeader from "@/components/layouts/dashboard-header";
import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Home,
  Megaphone,
  SendHorizonal,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import CreateCampaignButton from "@/components/campaigns/create-campaign";
import { api, HydrateClient } from "@/trpc/server";
import { CampaignsTable } from "./data-table";

export default async function CampaignsPage() {
  const contacts = await api.contact.getAllAvailable();
  const templates = await api.template.getAll();
  void api.campaign.getForTable({ limit: 10, offset: 0 });

  return (
    <HydrateClient>
      <DashboardHeader>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/">
              <Home size={20} strokeWidth={1.6} />
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Kampányok</BreadcrumbPage>
        </BreadcrumbList>
      </DashboardHeader>

      <main className="max-w-4xl w-full mx-auto h-full py-6 px-4">
        <div className="flex gap-3 items-center">
          <div
            className={cn(
              "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border text-violet-600",
            )}
          >
            <Megaphone className="size-5" />
          </div>

          <h1 className="text-2xl title">Kampányok</h1>
        </div>

        <p className="text-muted-foreground mb-6 mt-4 max-w-[600px]">
          A kampányokat használhatja később fel kontaktok értesítésére. Ezeket a
          kampányokat lehet hozzárendelni{" "}
          <b>manuális küldéshez, kampányokhoz vagy automatizált eseményekhez</b>
          .
        </p>

        <CreateCampaignButton contacts={contacts} templates={templates} />

        <Separator className="my-6" />

        <CampaignsTable />
      </main>
    </HydrateClient>
  );
}
