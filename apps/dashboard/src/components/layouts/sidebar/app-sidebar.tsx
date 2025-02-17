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
import { OrganizationSwitcher } from "@/components/layouts/sidebar/organization-switcher";
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
      items: [
        {
          title: "Megtekintés",
          url: "/kozonsegek/",
          icon: Eye,
        },
        {
          title: "Létrehozás",
          url: "/kozonsegek/letrehozas/",
          icon: PlusSquare,
        }
      ]
    },
    {
      title: "Emailek",
      icon: Mail,
      url: "/emailek/",
      items: [
        {
          title: "Megtekintés",
          url: "/emailek/",
          icon: Eye,
        },
        {
          title: "Létrehozás",
          url: "/emailek/letrehozas/",
          icon: PlusSquare,
        },
      ],
    },
    {
      title: "Kampányok",
      icon: Megaphone,
      url: "/kampanyok/",
      items: [
        {
          title: "Megtekintés",
          url: "/kampanyok/",
          icon: Eye,
        },
        {
          title: "Létrehozás",
          url: "/kamnanyok/letrehozas/",
          icon: PlusSquare,
        },
      ],
    },
    {
      title: "Sablonok",
      icon: FolderOpen,
      url: "/sablonok/",
      items: [
        {
          title: "Megtekintés",
          url: "/sablonok/",
          icon: Eye,
        },
        {
          title: "Létrehozás",
          url: "/sablonok/letrehozas/",
          icon: PlusSquare
        },
      ],
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
      <SidebarHeader className="border-b">
        <OrganizationSwitcher organizations={organizations} />
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
