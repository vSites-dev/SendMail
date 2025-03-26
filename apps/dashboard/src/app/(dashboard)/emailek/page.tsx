import DashboardHeader from "@/components/layouts/dashboard-header";
import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { api, HydrateClient } from "@/trpc/server";
import { Home, Mails, PlusSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { EmailsTable } from "./data-table";

export default async function EmailsPage() {
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
          <BreadcrumbPage>Emailek</BreadcrumbPage>
        </BreadcrumbList>
      </DashboardHeader>

      <main className="max-w-screen-md w-full mx-auto h-full py-6 px-4">
        <div className="flex gap-3 items-center">
          <div
            className={cn(
              "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border text-violet-600",
            )}
          >
            <Mails className="size-5" />
          </div>

          <h1 className="text-3xl font-semibold text-neutral-700">Emailek</h1>
        </div>

        <p className="text-muted-foreground mb-6 mt-4 max-w-[600px]">
          Itt tudja nyomon követni a már kiküldött emaileket. Láthatja többek
          között az <b>email státuszát, link kattintásokat</b> és minden fontos
          követhető információt azzal kapcsolatban.
        </p>

        <div className="flex gap-2 items-center">
          <Link href="/emailek/uj">
            <Button>
              <PlusSquare className="size-5" />
              Email(ek) manuális kiküldése
            </Button>
          </Link>

          <Link href="/kampanyok">
            <Button variant={"success"}>
              <PlusSquare className="size-5" />
              Új kampány létrehozása
            </Button>
          </Link>
        </div>

        <Separator className="my-6" />

        <EmailsTable />
      </main>
    </HydrateClient>
  );
}
