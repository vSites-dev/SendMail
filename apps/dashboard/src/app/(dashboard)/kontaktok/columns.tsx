import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  Eye,
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
import { Contact, ContactStatus } from "@prisma/client";
import { contactDataTableAtom } from "@/store/global";
import { cn, contactStatuses } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";

export const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: "email",
    header: "Email cím",
    enableSorting: true,
    cell: ({ row }) => {
      return (
        <Link
          className="hover:underline"
          href={`/kontaktok/${row.original?.id}`}
        >
          {row.original?.email}
        </Link>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Név",
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: "Státusz",
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ row }) => {
      const utils = api.useUtils();

      const { mutate: updateStatus, isPending } =
        api.contact.updateStatus.useMutation({
          onMutate: () => {
            const loadingToast = toast.loading("Státusz frissítése...");
            return { loadingToast };
          },
          onSuccess: () => {
            utils.contact.invalidate();

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
                    contactStatuses[row.original.status].bgColor,
                  )}
                ></div>
                {contactStatuses[row.original.status].label}
              </div>

              <ChevronsUpDown className="h-4 w-4 text-muted-foreground opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(contactStatuses).map(([key, value]) => (
              <DropdownMenuItem
                key={key}
                onClick={() =>
                  updateStatus({
                    id: row.original.id,
                    status: key as ContactStatus,
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
      const contact = row.original!;

      const { data: usersRole } = api.project.checkUsersRole.useQuery();
      const isAdminOrOwner = usersRole === 'ADMIN' || usersRole === 'OWNER';

      const utils = api.useUtils();

      const [menu, setMenu] = useState(false);
      const [deleteDialog, setDeleteDialog] = useState(false);
      const [contacts, setContacts] = useAtom(contactDataTableAtom);

      const { mutateAsync, isPending } = api.contact.delete.useMutation();

      async function handleDelete() {
        const res = await mutateAsync({ id: contact.id });

        if (res.success) {
          utils.contact.getForTable.invalidate();
          utils.contact.getAll.invalidate();
          utils.contact.getStatistics.invalidate();

          setContacts((prev) => prev.filter((d) => d.id !== contact.id));

          toast.success("A kontakt sikeresen törölve!");
        } else toast.error("Hiba történt a kontakt törlése közben!");

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
              <Link href={`/kontaktok/${contact.id}`}>
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
