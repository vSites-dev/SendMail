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
import { Home } from "lucide-react";

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
            <BreadcrumbPage>Sablonok</BreadcrumbPage>
          </BreadcrumbList>
        </DashboardHeader>

        <SettingsProvider>
          <PlateEditor />
        </SettingsProvider>
      </div>
    </HydrateClient>
  );
}
