import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "../ui/sidebar";

export default function DashboardHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <header className="flex h-[65px] shrink-0 items-center gap-2 transition-[width,height] ease-linear bg-white group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b sticky top-0 z-20">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>{children}</Breadcrumb>
      </div>
    </header>
  );
}
