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
import { Invitation, Project } from "@prisma/client";
import { OrganizationSwitcher } from "./organization-switcher";
import { authClient } from "@/lib/auth/client";

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
  invitations,
  organizations,
  activeOrganizationFromServer,
  activeProjectFromServer,
  ...sidebarProps
}: React.ComponentProps<typeof Sidebar> & {
  invitations: (Invitation & { organization: Organization })[];
  organizations: Organization[];
  activeOrganizationFromServer: Organization;
  activeProjectFromServer: Project;
}) {
  const session = authClient.useSession()

  const pendingNotExpiredInvitations = invitations.filter(invitation => invitation.status === "pending" && invitation.expiresAt > new Date());

  return (
    <Sidebar collapsible="icon" {...sidebarProps}>
      <SidebarHeader className="border-b">
        <OrganizationSwitcher
          invitations={pendingNotExpiredInvitations}
          organizations={organizations}
          activeOrganizationFromServer={activeOrganizationFromServer}
          activeProjectFromServer={activeProjectFromServer}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {session.data?.user && <NavUser user={session.data.user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
