import DashboardHeader from "@/components/layouts/dashboard-header";
import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { api, HydrateClient } from "@/trpc/server";
import { House } from "lucide-react";
import Link from "next/link";
import { DomainDetails } from "./domain-details";

export default async function Domain({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const domainId = (await params).id;

  const domain = await api.domain.getById({ id: domainId });

  return (
    <HydrateClient>
      <DashboardHeader>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/">
              <House size={20} strokeWidth={1.6} />
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link href="/domainek">Domainek</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{domain?.name}</BreadcrumbPage>
        </BreadcrumbList>
      </DashboardHeader>

      <main className="my-6 mx-4 h-full">
        {!domain ? (
          <h1 className="text-2xl font-semibold text-neutral-800">
            Nem találtuk a keresett domaint
          </h1>
        ) : (
          <DomainDetails domain={domain} />
        )}
      </main>
    </HydrateClient>
  );
}
