import DashboardHeader from "@/components/layouts/dashboard-header";
import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { api, HydrateClient } from "@/trpc/server";
import { Home, Mails } from "lucide-react";
import Link from "next/link";
import { EmailDetails } from "./email-details";

export default async function EmailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const emailId = (await params).id;

  const email = await api.email.getById({ id: emailId });

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
          <BreadcrumbItem>
            <Link href="/emailek">Emailek</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>
            {email?.subject || "Email adatok"}
          </BreadcrumbPage>
        </BreadcrumbList>
      </DashboardHeader>

      <main className="my-6 h-full max-w-screen-md w-full mx-auto">
        {!email ? (
          <h1 className="text-2xl font-semibold text-neutral-800">
            Nem találtuk a keresett emailt
          </h1>
        ) : (
          <EmailDetails email={email} />
        )}
      </main>
    </HydrateClient>
  );
}
