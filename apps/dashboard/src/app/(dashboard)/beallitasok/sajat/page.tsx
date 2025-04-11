export const dynamic = 'force-dynamic'

import DashboardHeader from "@/components/layouts/dashboard-header";
import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { api, HydrateClient } from "@/trpc/server";
import { Cog, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth/auth";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await getHeaders() })
  if (!session?.session.id) redirect("/bejelentkezes")

  const fullOrganization = await api.project.getFullOrganization()

  const headersList = await getHeaders();
  const urlStr = headersList.get("x-url");
  let defaultTab = "personal";
  if (urlStr) {
    try {
      const url = new URL(urlStr);
      defaultTab = url.searchParams.get("tab") || "personal";
    } catch (e) {
      console.error("Invalid URL:", e);
    }
  }

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
          <BreadcrumbPage>Beállítások</BreadcrumbPage>
        </BreadcrumbList>
      </DashboardHeader>

      <main className="max-w-screen-md w-full mx-auto h-full py-6 px-4">
        <div className="flex gap-3 items-center">
          <div
            className={cn(
              "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border text-violet-600",
            )}
          >
            <Cog className="size-5" />
          </div>

          <h1 className="text-2xl title">Beállítások</h1>
        </div>

        <SettingsTabs defaultTab={defaultTab} user={session?.user} fullOrganization={fullOrganization} />
      </main>
    </HydrateClient>
  );
}
