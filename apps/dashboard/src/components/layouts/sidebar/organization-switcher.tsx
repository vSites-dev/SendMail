"use client";

import { ChevronsUpDown, Plus, Router } from "lucide-react";

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
import { useAtom } from "jotai";
import { activeProjectAtom, activeOrganizationAtom } from "@/store/global";
import { useHydrateAtoms } from "jotai/utils";
import { authClient } from "@/lib/auth/client";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@prisma/client";

export function OrganizationSwitcher({
  organizations,
  activeProjectFromServer,
  activeOrganizationFromServer,
}: {
  organizations: Organization[];
  activeOrganizationFromServer: Organization;
  activeProjectFromServer: Project;
}) {
  const router = useRouter();

  useHydrateAtoms([[activeOrganizationAtom, activeOrganizationFromServer]]);

  useHydrateAtoms([[activeProjectAtom, activeProjectFromServer]]);

  const { isMobile } = useSidebar();

  const [activeOrganization, setActiveOrganization] = useAtom(
    activeOrganizationAtom,
  );
  const [activeProject, setActiveProject] = useAtom(activeProjectAtom);

  const { data: newChatbot } = api.chatbot.getByOrgId.useQuery({
    organizationId: activeOrganization?.id ?? "",
  });

  async function switchOrganization(organizationId: string) {
    const newOrg = await authClient.organization.setActive({
      organizationId: organizationId,
    });

    setActiveOrganization(newOrg?.data as any);
  }

  useEffect(() => {
    if (newChatbot && newChatbot.id !== activeChatbot?.id) {
      setActiveChatbot(newChatbot);

      router.push("/");

      window.location.reload();
    }
  }, [newChatbot]);

  if (organizations.length === 0 || !activeChatbot) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground rounded-sm relative">
                <img
                  className="size-8"
                  src={
                    (activeChatbot.links as ChatbotLinks).icon ??
                    "/brand/icon.png"
                  }
                  alt={activeOrganization?.name ?? "Chatbot"}
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeOrganization?.name}
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
              Chatbotok
            </DropdownMenuLabel>
            {organizations.map((organization, index) => (
              <DropdownMenuItem
                key={organization.slug}
                onClick={() => switchOrganization(organization.id)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border relative">
                  <img
                    className="size-6"
                    src={organization.logo ?? "/brand/icon.png"}
                    alt={organization.name}
                  />
                </div>
                {organization.name}
                <DropdownMenuShortcut>{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled
              className="gap-2 p-2"
            // onClick={() => handleNewChatbot()}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium line-through text-muted-foreground">
                Új chatbot
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
