import { AppSidebar } from "@/components/layouts/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import redirectNonAuthenticated from "@/lib/auth/redirect-non-authenticated";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectNonAuthenticated();

  const headersObject = await headers();

  const [session, organizations, activeOrganization] = await Promise.all([
    auth.api.getSession({ headers: headersObject }),
    auth.api.listOrganizations({ headers: headersObject }),
    auth.api.getFullOrganization({ headers: headersObject }),
  ]);

  if (organizations.length === 0) {
    return redirect("/uj-projekt");
  } else if (!activeOrganization) {
    await auth.api.setActiveOrganization({
      body: {
        organizationId: organizations[organizations.length - 1]!.id,
      },
    });
  }

  const project = await api.project.getById({
    organizationId: activeOrganization!.id,
  });
  if (!project) throw new Error("Nem talált projekt");

  return (
    <SidebarProvider>
      <AppSidebar
        session={session}
        organizations={organizations}
        activeOrganizationFromServer={activeOrganization!}
        activeProjectFromServer={project}
      />
      <SidebarInset>
        <div className="min-h-[100dvh] relative h-full overflow-y-clip bg-background flex flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
