import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash,
  Trash2,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { CampaignStatus } from "@prisma/client";
import { campaignDataTableAtom, CampaignWithCounts } from "@/store/global";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";

// Define campaign status styles
const campaignStatuses = {
  [CampaignStatus.SCHEDULED]: {
    label: "Ütemezve",
    bgColor: "bg-yellow-400",
  },
  [CampaignStatus.COMPLETED]: {
    label: "Befejezve",
    bgColor: "bg-green-500",
  },
};


export const columns: ColumnDef<CampaignWithCounts>[] = [
  {
    accessorKey: "name",
    header: "Név",
    enableSorting: true,
    cell: ({ row }) => {
      return (
        <Link
          className="hover:underline"
          href={`/kampanyok/${row.original?.id}`}
        >
          {row.original?.name}
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Státusz",
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ row }) => {
      const utils = api.useUtils();

      const { mutate: updateStatus, isPending } =
        api.campaign.updateStatus.useMutation({
          onMutate: () => {
            const loadingToast = toast.loading("Státusz frissítése...");
            return { loadingToast };
          },
          onSuccess: () => {
            utils.campaign.invalidate();

            toast.success("Státusz sikeresen frissítve");
          },
          onError: (error) => {
            toast.error("Hiba történt a státusz frissítése során");
            console.error("Error updating status:", error);
          },
          onSettled: (_, __, ___, context) => {
            toast.dismiss(context?.loadingToast);
          },
        });

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-max justify-start text-left font-normal p-0 hover:bg-transparent hover:underline",
                isPending && "opacity-50 cursor-not-allowed",
              )}
              disabled={isPending}
            >
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mr-2",
                    campaignStatuses[row.original.status].bgColor,
                  )}
                ></div>
                {campaignStatuses[row.original.status].label}
              </div>

              <ChevronsUpDown className="h-4 w-4 text-muted-foreground opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(campaignStatuses).map(([key, value]) => (
              <DropdownMenuItem
                key={key}
                onClick={() =>
                  updateStatus({
                    id: row.original.id,
                    status: key as CampaignStatus,
                  })
                }
                className="flex items-center"
              >
                <div
                  className={cn("w-2 h-2 rounded-full mr-2", value.bgColor)}
                ></div>
                {value.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "contactsCount",
    header: "Kontaktok",
    enableSorting: true,
    cell: ({ row }) => {
      return <p><b>{row.original.contactsCount}</b> <span className="text-muted-foreground">kontakt</span></p>;
    },
  },
  {
    accessorKey: "emailsCount",
    header: "Emailek",
    enableSorting: true,
    cell: ({ row }) => {
      return <p><b>{row.original.emailsCount}</b> <span className="text-muted-foreground">email</span></p>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Frissítve",
    enableSorting: true,
    cell: ({ row }) => {
      return new Date(row.original.updatedAt).toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const campaign = row.original!;

      const { data: usersRole } = api.project.checkUsersRole.useQuery();
      const isAdminOrOwner = usersRole === 'ADMIN' || usersRole === 'OWNER';

      const utils = api.useUtils();

      const [menu, setMenu] = useState(false);
      const [deleteDialog, setDeleteDialog] = useState(false);
      const [campaigns, setCampaigns] = useAtom(campaignDataTableAtom);

      const { mutateAsync, isPending } = api.campaign.delete.useMutation();      

      async function handleDelete() {
        const res = await mutateAsync({ id: campaign.id });

        if (res.success) {
          utils.campaign.getForTable.invalidate();
          utils.campaign.getAll.invalidate();
          utils.campaign.getStatistics.invalidate();

          setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));

          toast.success("A kampány sikeresen törölve!");
        } else toast.error("Hiba történt a kampány törlése közben!");

        setDeleteDialog(false);
        setMenu(false);
      }

      return (
        <DropdownMenu open={menu} onOpenChange={setMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Műveletek megnyitása</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/kampanyok/${campaign.id}`}>
                {isAdminOrOwner ? (
                  <>
                    <Pencil className="mr-2 h-4 w-4" />
                    Szerkesztés
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Megtekintés
                  </>
                )}
              </Link>
            </DropdownMenuItem>
            {isAdminOrOwner && (
              <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Törlés
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Biztosan törölni szeretnéd?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Ez a művelet visszavonhatatlan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Mégsem</AlertDialogCancel>
                    <Button
                      variant={"destructive"}
                      onClick={handleDelete}
                      isLoading={isPending}
                    >
                      {!isPending && <Trash2 className="size-4" />}
                      Törlés
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
