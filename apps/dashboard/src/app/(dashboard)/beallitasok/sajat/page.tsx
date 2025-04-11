export const dynamic = "force-dynamic";

import { UserCog } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth/auth";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import getActiveProject from "@/lib/get-active-project";
import PersonalSettingsForm from "./form";
import LinkStatus from "@/components/ui/link-status";

export default async function PersonalSettingsPage() {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session?.session.id || !session.session.activeOrganizationId)
    redirect("/bejelentkezes");

  const activeProject = await getActiveProject(
    session.session.activeOrganizationId,
  );

  return (
    <>
      <div className="flex justify-between items-center w-full mb-6">
        <div className="flex gap-3 items-center">
          <div
            className={cn(
              "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border text-violet-600",
            )}
          >
            <UserCog className="size-5" />
          </div>

          <h1 className="text-2xl title">Saját Beállítások</h1>
        </div>

        <Button asChild variant="ghost">
          <Link href="/beallitasok/projekt" className="flex items-center gap-2">
            {activeProject?.name} beállításai
          </Link>
        </Button>
      </div>

      <PersonalSettingsForm user={session.user} />
    </>
  );
}
