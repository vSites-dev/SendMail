export const dynamic = "force-dynamic";

import React from "react";
import { headers as getHeaders } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { HydrateClient } from "@/trpc/server";
import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import DashboardHeader from "@/components/layouts/dashboard-header";
import { Home } from "lucide-react";
import Link from "next/link";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session?.session.id) redirect("/bejelentkezes");

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
        {children}
      </main>
    </HydrateClient>
  );
}
