import DashboardHeader from "@/components/layouts/dashboard-header";
import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { api, HydrateClient } from "@/trpc/server";
import { FolderOpen, Home, Mails, PlusSquare, SendHorizonal, Users2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default async function CampaignsPage() {
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

      <main className="max-w-screen-md w-full mx-auto h-full py-6 px-4">
        <div className="flex gap-3 items-center">
          <div
            className={cn(
              "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border text-violet-600",
            )}
          >
            <SendHorizonal className="size-5" />
          </div>

          <h1 className="text-3xl font-semibold text-neutral-800">Kampányok</h1>
        </div>

        <p className="text-muted-foreground mb-6 mt-4 max-w-[600px]">
          A kampányokat használhatja később fel kontaktok értesítésére. Ezeket a kampányokat lehet hozzárendelni <b>manuális küldéshez, kampányokhoz vagy automatizált eseményekhez</b>.
        </p>

        <Link href="/kampanyok/uj">
          <Button>
            <PlusSquare className="size-5" />
            Új kampány létrehozása
          </Button>
        </Link>

        <Separator className="my-6" />

        <div className="h-6"></div>
      </main>
    </HydrateClient>
  );
}
