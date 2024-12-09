"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Organization } from "@/lib/auth/auth";
import { authClient } from "@/lib/auth/client";
import Image from "next/image";

export function OrganizationSwitcher({
  organizations,
}: {
  organizations: Organization[];
}) {
  const { isMobile } = useSidebar();
  const [activeOrganization, setActiveOrganization] = React.useState(
    organizations[0],
  );

  // TODO: handle creating new organization
  const handleNewChatbot = async () => {
    await authClient.organization.create({
      name: "LeoAI",
      logo: "https://leoai.hu/favicon.svg",
      slug: "leoai",
    });
  };

  if (organizations.length === 0 || !activeOrganization) {
    return <></>;
  }

  // TODO: proper default organization logo instead of https://leoai.hu/favicon.svg

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground relative">
                <Image
                  fill
                  src={
                    activeOrganization.logo ?? "https://leoai.hu/favicon.svg"
                  }
                  alt={activeOrganization.name}
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeOrganization?.name.toString()}
                </span>
                {/* <span className="truncate text-xs">{activeOrganization.}</span> */}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Válassz szervezetet
            </DropdownMenuLabel>
            {organizations.map((organization, index) => (
              <DropdownMenuItem
                key={organization.slug}
                onClick={() => setActiveOrganization(organization)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border relative">
                  <Image
                    fill
                    src={organization.logo ?? "https://leoai.hu/favicon.svg"}
                    alt={organization.name}
                  />
                </div>
                {organization.name}
                <DropdownMenuShortcut>{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => handleNewChatbot()}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Új szervezet
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
