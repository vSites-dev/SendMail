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

const data = {
  navMain: [
    {
      title: "Vezérlőpult",
      url: "/",
      icon: BarChartBigIcon,
    },
    {
      title: "Közönségek",
      icon: Users,
      url: "/kozonsegek/",
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
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  session: { session: Session; user: User } | null;
  organizations: Organization[];
}) {
  const { session, organizations } = props;

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* <SidebarHeader className="border-b">
      </SidebarHeader> */}
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
