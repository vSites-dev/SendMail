"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Settings2 } from "lucide-react";
import PersonalSettings from "./personal-settings";
import ProjectSettings from "./project-settings";

export default function SettingsTabs({ defaultTab, user, fullOrganization }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") || defaultTab;

  const handleTabChange = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`/beallitasok?${params.toString()}`);
  };

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className="w-full mt-6">
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
        <PersonalSettings user={user} />
      </TabsContent>

      <TabsContent value="project">
        <ProjectSettings user={user} fullOrganization={fullOrganization} />
      </TabsContent>
    </Tabs>
  );
}
