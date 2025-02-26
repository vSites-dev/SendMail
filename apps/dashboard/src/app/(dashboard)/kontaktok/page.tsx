import DashboardHeader from "@/components/layouts/dashboard-header";
import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { api, HydrateClient } from "@/trpc/server";
import { ContactsTable } from "./data-table";
import { Home, PlusSquare, Users2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default async function Contacts() {
  void api.contact.getForTable({ limit: 10, offset: 0 });

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
          <BreadcrumbPage>Kontaktok</BreadcrumbPage>
        </BreadcrumbList>
      </DashboardHeader>

      <main className="max-w-screen-md w-full mx-auto h-full py-6 px-4">
        <div className="flex gap-3 items-center">
          <div
            className={cn(
              "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border text-violet-600",
            )}
          >
            <Users2 className="size-5" />
          </div>

          <h1 className="text-3xl font-semibold text-neutral-700">Kontaktok</h1>
        </div>

        <p className="text-muted-foreground mb-6 mt-4 max-w-[600px]">
          A kontaktok egy-egy személyt jelentenek a projektek email listáján.
          Ezek az elérhetőségek később{" "}
          <b>egyedi emailekhez, kampányokhoz vagy automatizált üzenetekhez</b>{" "}
          rendelhetők hozzá.
        </p>

        <Link href="/kontaktok/uj">
          <Button>
            <PlusSquare className="size-5" />
            Új kontakt létrehozása
          </Button>
        </Link>

        <Separator className="my-6" />

        <ContactsTable />
      </main>
    </HydrateClient>
  );
}
