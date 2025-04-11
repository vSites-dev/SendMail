import { AppSidebar } from "@/components/layouts/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import redirectNonAuthenticated from "@/lib/auth/redirect-non-authenticated";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { db } from "@/server/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectNonAuthenticated();

  const headersObject = await headers();

  const session = await auth.api.getSession({ headers: headersObject });
  const activeOrg = await auth.api.getFullOrganization({
    headers: headersObject,
  });

  const membersForTheUser = await db.member.findMany({
    where: {
      userId: session?.user.id!,
    },
  });

  const invitations = await db.invitation.findMany({
    where: {
      email: session?.user.email!,
    },
    include: {
      organization: true,
    },
  });

  if (membersForTheUser.length === 0) {
    if (invitations && invitations[0] && invitations[0].id) {
      return redirect(`/projekt-meghivas/${invitations[0].id}`);
    }

    return redirect("/uj-projekt/1");
  }

  const organizationsThatUserIsPartOf = await db.organization.findMany({
    where: {
      members: {
        some: {
          userId: session?.user.id!,
        },
      },
    },
  });

  if (!activeOrg) {
    await auth.api.setActiveOrganization({
      body: {
        organizationId: organizationsThatUserIsPartOf[0]!.id,
      },
    });
  }

  const project = await api.project.getById({
    organizationId: activeOrg?.id || organizationsThatUserIsPartOf[0]!.id,
  });
  if (!project) throw new Error("Nem talált projekt");

  return (
    <SidebarProvider>
      <AppSidebar
        activeOrganizationFromServer={
          (activeOrg || organizationsThatUserIsPartOf[0]) as any
        }
        activeProjectFromServer={project}
        invitations={invitations as any}
        organizations={organizationsThatUserIsPartOf as any}
      />
      <SidebarInset>
        <div className="min-h-[100dvh] relative h-full overflow-y-clip bg-background flex flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
