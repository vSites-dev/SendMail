import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  Eye,
  Trash2,
  Loader2,
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
import { Contact } from "@prisma/client";
import { contactDataTableAtom } from "@/store/global";

export const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: "email",
    header: "Email cím",
    enableSorting: true,
    cell: ({ row }) => {
      return (
        <Link className="hover:underline" href={`/kontaktok/${row.original?.id}`}>
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
    cell: ({ row }) => {
      const statusColors = {
        SUBSCRIBED: "bg-green-500",
        UNSUBSCRIBED: "bg-gray-500",
        BOUNCED: "bg-red-500",
        COMPLAINED: "bg-yellow-500",
      };

      const statusLabels = {
        SUBSCRIBED: "Feliratkozva",
        UNSUBSCRIBED: "Leiratkozva",
        BOUNCED: "Visszapattant????",
        COMPLAINED: "Fellebezzett??",
      };

      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[row.original.status as keyof typeof statusColors]
            } text-white`}
        >
          {statusLabels[row.original.status as keyof typeof statusLabels]}
        </span>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Frissítve",
    enableSorting: true,
    cell: ({ row }) => {
      return new Date(row.original.updatedAt).toLocaleDateString();
    }
  },
  {
    id: "actions",

    cell: ({ row }) => {
      const contact = row.original!;

      const utils = api.useUtils();

      // eslint-disable-next-line
      const [menu, setMenu] = useState(false);
      // eslint-disable-next-line
      const [deleteDialog, setDeleteDialog] = useState(false);
      // eslint-disable-next-line
      const [contacts, setContacts] = useAtom(contactDataTableAtom);

      const { mutateAsync, isPending } = api.contact.delete.useMutation();

      async function handleDelete() {
        const res = await mutateAsync({ id: contact.id });

        if (res.success) {
          utils.contact.getForTable.invalidate();
          utils.contact.getAll.invalidate();

          setContacts((prev) => prev.filter((d) => d.id !== contact.id));

          toast.success("A kontakt sikeresen törölve!");
        } else toast.error("Hiba történt a kontakt törlése közben!");

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
                <Pencil className="mr-2 h-4 w-4" />
                Szerkesztés
              </Link>
            </DropdownMenuItem>
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
                    disabled={isPending}
                    onClick={handleDelete}
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    Törlés
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
