export const dynamic = "force-dynamic";

import { api } from "@/trpc/server";
import { ShieldEllipsis } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth/auth";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProjectSettingsForm from "./form";
import LinkStatus from "@/components/ui/link-status";

export default async function ProjectSettingsPage() {
  const session = await auth.api.getSession({ headers: await getHeaders() });
  if (!session?.session.id || !session.session.activeOrganizationId)
    redirect("/bejelentkezes");

  const fullOrganization = await api.project.getFullOrganization();

  return (
    <>
      <div className="flex justify-between items-center w-full mb-6">
        <div className="flex gap-3 items-center">
          <div
            className={cn(
              "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border text-violet-600",
            )}
          >
            <ShieldEllipsis className="size-5" />
          </div>

          <h1 className="text-2xl title">
            {fullOrganization.project?.name} beállításai
          </h1>
        </div>

        <Button asChild variant="ghost">
          <Link href="/beallitasok/sajat" className="flex items-center gap-2">
            Saját beállítások
          </Link>
        </Button>
      </div>

      <ProjectSettingsForm
        user={session.user}
        fullOrganization={fullOrganization}
      />
    </>
  );
}
