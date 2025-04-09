import DashboardHeader from "@/components/layouts/dashboard-header";
import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { api, HydrateClient } from "@/trpc/server";
import Link from "next/link";
import { House } from "lucide-react";
import CreateDomainForm from "./form";
import { redirect } from "next/navigation";

export default async function UjDomain() {
  const userRole = await api.project.checkUsersRole();

  if (userRole !== 'ADMIN' && userRole !== 'OWNER') return redirect("/domainek");

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
          <BreadcrumbPage>Új domain létrehozása</BreadcrumbPage>
        </BreadcrumbList>
      </DashboardHeader>

      <main className="max-w-2xl w-full mx-auto space-y-4 h-full py-2 px-4">
        <CreateDomainForm />
      </main>
    </HydrateClient>
  );
}
