import { Toaster } from "sonner";

import { PlateEditor } from "@/components/editor/plate-editor";
import { SettingsProvider } from "@/components/editor/settings";
import { HydrateClient } from "@/trpc/server";
import DashboardHeader from "@/components/layouts/dashboard-header";
import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { FolderPlus, Home } from "lucide-react";
import { TemplateCreator } from "@/components/editor/template-creator";
import { cn } from "@/lib/utils";

export default function Page() {
  return (
    <HydrateClient>
      <div className="h-screen w-full" data-registry="plate">
        <DashboardHeader>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href="/">
                <Home size={20} strokeWidth={1.6} />
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Link href="/sablonok">Sablonok</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Új sablon</BreadcrumbPage>
          </BreadcrumbList>
        </DashboardHeader>

        <main className="max-w-screen-md w-full mx-auto h-full py-6 px-4">
          <div className="flex gap-3 items-center">
            <div
              className={cn(
                "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border text-violet-600",
              )}
            >
              <FolderPlus className="size-5" />
            </div>

            <h1 className="text-2xl title">
              Új sablon
            </h1>
          </div>

          <SettingsProvider>
            <TemplateCreator />
          </SettingsProvider>
        </main>
      </div>
    </HydrateClient>
  );
}
