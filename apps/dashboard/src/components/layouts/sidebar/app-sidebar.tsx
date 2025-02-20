"use client";

import * as React from "react";
import {
  BarChartBigIcon,
  Eye,
  FolderOpen,
  Globe,
  Mail,
  Megaphone,
  PlusSquare,
  Users,
  Users2,
} from "lucide-react";
import { NavMain } from "@/components/layouts/sidebar/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { Session, User } from "better-auth";
import { NavUser } from "./nav-user";
import { type Organization } from "@/lib/auth/auth";
import { Project } from "@prisma/client";
import { OrganizationSwitcher } from "./organization-switcher";

const data = {
  navMain: [
    {
      title: "Vezérlőpult",
      url: "/",
      icon: BarChartBigIcon,
    },
    {
      title: "Kontaktok",
      icon: Users2,
      url: "/kontaktok/",
    },
    {
      title: "Emailek",
      icon: Mail,
      url: "/emailek/",
    },
    {
      title: "Kampányok",
      icon: Megaphone,
      url: "/kampanyok/",
    },
    {
      title: "Sablonok",
      icon: FolderOpen,
      url: "/sablonok/",
    },
    {
      title: "Domainek",
      url: "/domainek/",
      icon: Globe,
    },
  ],
};

export function AppSidebar({
  session,
  organizations,
  activeOrganizationFromServer,
  activeProjectFromServer,
  ...sidebarProps
}: React.ComponentProps<typeof Sidebar> & {
  session: { session: Session; user: User } | null;
  organizations: Organization[];
  activeOrganizationFromServer: Organization;
  activeProjectFromServer: Project;
}) {
  return (
    <Sidebar collapsible="icon" {...sidebarProps}>
      <SidebarHeader className="border-b">
        <OrganizationSwitcher
          organizations={organizations}
          activeOrganizationFromServer={activeOrganizationFromServer}
          activeProjectFromServer={activeProjectFromServer}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {session && <NavUser user={session.user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
