import DashboardHeader from "@/components/layouts/dashboard-header";
import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HydrateClient } from "@/trpc/server";
import { Cog, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings2 } from "lucide-react";
import PersonalSettings from "./personal-settings";
import ProjectSettings from "./project-settings";

export default async function SettingsPage() {
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

        <Tabs defaultValue="personal" className="w-full mt-6">
          <TabsList>
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Személyes beállítások
            </TabsTrigger>
            <TabsTrigger value="project" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Projekt beállítások
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <PersonalSettings />
          </TabsContent>

          <TabsContent value="project">
            <ProjectSettings />
          </TabsContent>
        </Tabs>
      </main>
    </HydrateClient>
  );
}
