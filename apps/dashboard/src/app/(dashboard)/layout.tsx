import { AppSidebar } from "@/components/layouts/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import redirectNonAuthenticated from "@/lib/auth/redirect-non-authenticated";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

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

  return (
    <SidebarProvider>
      <AppSidebar session={session} organizations={organizations} />
      <SidebarInset>
        <div className="min-h-[100dvh] relative h-full overflow-y-clip bg-background flex flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
