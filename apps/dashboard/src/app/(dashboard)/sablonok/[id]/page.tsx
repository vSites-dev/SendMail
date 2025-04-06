import { TemplateEditor } from "@/components/editor/template-editor";
import DashboardHeader from "@/components/layouts/dashboard-header";
import {
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { api, HydrateClient } from "@/trpc/server";
import { FolderCog, House } from "lucide-react";
import Link from "next/link";

export default async function Template({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const templateId = (await params).id;

  const template = await api.template.getById({ id: templateId });

  return (
    <HydrateClient>
      <DashboardHeader>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/">
              <House size={20} strokeWidth={1.6} />
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link href="/sablonok">Sablonok</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{template?.name}</BreadcrumbPage>
        </BreadcrumbList>
      </DashboardHeader>

      <main className="max-w-4xl w-full mx-auto h-full py-6 px-4">
        <div className="flex gap-3 items-center">
          <div
            className={cn(
              "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border text-violet-600",
            )}
          >
            <FolderCog className="size-5" />
          </div>

          <h1 className="text-2xl title">Új sablon</h1>
        </div>

        {!template ? (
          <h1 className="text-2xl font-semibold text-neutral-800">
            Nem találtuk a keresett sablont
          </h1>
        ) : (
          <TemplateEditor template={template} />
        )}
      </main>
    </HydrateClient>
  );
}
