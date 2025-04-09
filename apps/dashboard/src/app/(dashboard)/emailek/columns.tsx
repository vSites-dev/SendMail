import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Trash2,
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
import { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Email, EmailStatus } from "@prisma/client";
import { emailDataTableAtom } from "@/store/global";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { Badge } from "@/components/ui/badge";
import { GetForTableEmail } from "@/server/api/routers/emails";
import { authClient } from "@/lib/auth/client";

export const emailStatuses: Record<
  EmailStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  QUEUED: {
    label: "Küldés alatt",
    bgColor: "bg-yellow-400",
    textColor: "text-yellow-500",
  },
  SENT: {
    label: "Elküldve",
    bgColor: "bg-blue-400",
    textColor: "text-blue-500",
  },
  DELIVERED: {
    label: "Kézbesítve",
    bgColor: "bg-green-400",
    textColor: "text-green-500",
  },
  COMPLAINED: {
    label: "Panasz",
    bgColor: "bg-orange-400",
    textColor: "text-orange-500",
  },
  BOUNCED: {
    label: "Visszapattant",
    bgColor: "bg-red-400",
    textColor: "text-red-500",
  },
  FAILED: {
    label: "Hiba",
    bgColor: "bg-red-400",
    textColor: "text-red-500",
  },
};

export const columns: ColumnDef<GetForTableEmail>[] = [
  {
    accessorKey: "campaign",
    header: "Kampány",
    enableSorting: true,
    cell: ({ row }) => {
      return row.original?.campaign?.name ? (
        <Link
          className="hover:underline"
          href={`/kampanyok/${row.original?.campaign.id}`}
        >
          {row.original?.campaign.name || "N/A"}
        </Link>
      ) : (
        <Badge variant="outline">Manuális</Badge>
      );
    },
  },
  {
    accessorKey: "subject",
    header: "Tárgy",
    enableSorting: true,
    cell: ({ row }) => {
      return (
        <Link className="hover:underline" href={`/emailek/${row.original?.id}`}>
          {row.original?.subject}
        </Link>
      );
    },
  },
  {
    accessorKey: "contact",
    header: "Címzett",
    enableSorting: true,
    cell: ({ row }) => {
      return (
        <Link
          className="hover:underline"
          href={`/kontaktok/${row.original?.contact.id}`}
        >
          {row.original?.contact.email || "N/A"}
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

      return (
        <div className="flex items-center">
          <div
            className={cn(
              "w-2 h-2 rounded-full mr-2",
              emailStatuses[row.original.status].bgColor,
            )}
          ></div>
          {emailStatuses[row.original.status].label}
        </div>
      );
    },
  },
  {
    accessorKey: "sentAt",
    header: "Küldés ideje",
    enableSorting: true,
    cell: ({ row }) => {
      return row.original.sentAt
        ? new Date(row.original.sentAt).toLocaleDateString("hu-HU", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        : "N/A";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const email = row.original!;

      const { data: usersRole } = api.project.checkUsersRole.useQuery();
      console.debug("usersRole", usersRole);
      const isAdminOrOwner = usersRole === 'ADMIN' || usersRole === 'OWNER';

      const utils = api.useUtils();

      const [menu, setMenu] = useState(false);
      const [deleteDialog, setDeleteDialog] = useState(false);
      const [emails, setEmails] = useAtom(emailDataTableAtom);

      const { mutateAsync, isPending } = api.email.delete.useMutation();

      async function handleDelete() {
        const res = await mutateAsync({ id: email.id });

        if (res.success) {
          utils.email.getForTable.invalidate();
          utils.email.getAll.invalidate();
          utils.email.getStatistics.invalidate();

          setEmails((prev) => prev.filter((e) => e.id !== email.id));

          toast.success("Az email sikeresen törölve!");
        } else toast.error("Hiba történt az email törlése közben!");

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
              <Link href={`/emailek/${email.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Megtekintés
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
