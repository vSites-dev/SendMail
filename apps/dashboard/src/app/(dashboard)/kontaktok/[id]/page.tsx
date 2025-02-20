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
import ContactEditForm from "./form";

export default async function Contact({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const contactId = (await params).id;

  const contact = await api.contact.getById({ id: contactId });

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
            <Link href="/kontaktok">Kontaktok</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{contact?.email}</BreadcrumbPage>
        </BreadcrumbList>
      </DashboardHeader>

      <main className="my-6 mx-4 h-full">
        {!contact ? (
          <h1 className="text-2xl font-semibold text-neutral-800">
            Nem találtuk a keresett kontaktok
          </h1>
        ) : (
          <ContactEditForm contact={contact} />
        )}

      </main>
    </HydrateClient>
  );
}
