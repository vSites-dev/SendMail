"use client";

import { ChevronsUpDown, Megaphone, Plus, Rocket } from "lucide-react";
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
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Invitation, Project } from "@prisma/client";
import Link from "next/link";
import RoleIndicator from "@/components/ui/role-indicator";

export function OrganizationSwitcher({
  organizations,
  activeProjectFromServer,
  activeOrganizationFromServer,
  invitations,
}: {
  organizations: Organization[];
  activeOrganizationFromServer: Organization;
  activeProjectFromServer: Project;
  invitations: (Invitation & { organization: Organization })[];
}) {
  const router = useRouter();

  useHydrateAtoms([[activeOrganizationAtom, activeOrganizationFromServer]]);
  useHydrateAtoms([[activeProjectAtom, activeProjectFromServer]]);

  const { isMobile } = useSidebar();

  const [activeOrganization, setActiveOrganization] = useAtom(
    activeOrganizationAtom,
  );
  const [activeProject, setActiveProject] = useAtom(activeProjectAtom);

  const { data: newProject } = api.project.getById.useQuery(
    {
      organizationId: activeOrganization?.id ?? "",
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  );

  async function switchOrganization(organizationId: string) {
    const newOrg = await authClient.organization.setActive({
      organizationId: organizationId,
    });

    setActiveOrganization(newOrg?.data as any);
  }

  useEffect(() => {
    if (newProject && newProject.id !== activeProject?.id) {
      setActiveProject(newProject);

      router.push("/");

      window.location.reload();
    }
  }, [newProject]);

  if (organizations.length === 0 || !activeOrganization) return null;

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
                  suppressHydrationWarning
                  className="size-8"
                  src={activeOrganization.logo || "/brand/icon.jpg"}
                  alt={
                    activeOrganization?.name ??
                    "Porjekt#" + activeOrganization.id
                  }
                />
              </div>
              <div className="grid space-y-1 flex-1 text-left text-sm leading-tight">
                <span
                  className="truncate font-semibold"
                  suppressHydrationWarning
                >
                  {activeOrganization?.name}
                </span>
                <RoleIndicator />
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
              Projektek
            </DropdownMenuLabel>
            {organizations.map((organization, index) => (
              <DropdownMenuItem
                key={organization.slug}
                onClick={() => switchOrganization(organization.id)}
                className="gap-3 p-2 mt-1"
                suppressHydrationWarning
              >
                <div className="flex size-6 items-center justify-center rounded-sm border relative">
                  <img
                    suppressHydrationWarning
                    className="size-6"
                    src={organization.logo || "/brand/icon.jpg"}
                    alt={organization.name}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{organization.name}</p>
                  <RoleIndicator />
                </div>
              </DropdownMenuItem>
            ))}

            {invitations?.map((invitation, index) => (
              <DropdownMenuItem
                key={invitation.id}
                onClick={() => {
                  router.push(`/projekt-meghivas/${invitation.id}`);
                }}
                className="gap-2 p-2 items-center"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border relative">
                  <img
                    suppressHydrationWarning
                    className="size-6"
                    src={invitation.organization.logo ?? "/brand/icon.jpg"}
                    alt={invitation.organization.name}
                  />
                </div>
                <div>
                  <p
                    className="text-xs text-violet-600 mb-0 flex items-center gap-1"
                    suppressHydrationWarning
                  >
                    <Megaphone className="size-3 text-violet-600" />

                    {invitation.organization.name}
                  </p>
                  <p className="mt-0">Meghívás elfogadása</p>
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" asChild>
              <Link href="/uj-projekt/1">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Rocket className="size-4 text-indigo-600" />
                </div>
                <span>Új SendMail projekt</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
