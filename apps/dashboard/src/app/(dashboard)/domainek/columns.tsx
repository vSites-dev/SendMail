import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Trash2,
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
import { Contact, ContactStatus, Domain, DomainStatus } from "@prisma/client";
import { contactDataTableAtom, domainDataTableAtom } from "@/store/global";
import { cn, domainStatuses } from "@/lib/utils";

export const columns: ColumnDef<Domain>[] = [
  {
    accessorKey: "name",
    header: "Domain",
    enableSorting: true,
    cell: ({ row }) => {
      return (
        <Link
          className="hover:underline"
          href={`/domainek/${row.original?.id}`}
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
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <div
            className={cn(
              "w-2 h-2 rounded-full mr-2",
              domainStatuses[row.original.status].bgColor,
            )}
          ></div>
          {domainStatuses[row.original.status].label}
        </div>
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
      const domain = row.original!;

      const utils = api.useUtils();

      // eslint-disable-next-line
      const [menu, setMenu] = useState(false);
      // eslint-disable-next-line
      const [deleteDialog, setDeleteDialog] = useState(false);
      // eslint-disable-next-line
      const [domains, setDomains] = useAtom(domainDataTableAtom);

      const { mutateAsync, isPending } = api.domain.delete.useMutation();

      async function handleDelete() {
        const res = await mutateAsync({ id: domain.id });

        if (res.success) {
          utils.domain.getForTable.invalidate();
          utils.domain.getAll.invalidate();

          setDomains((prev) => prev.filter((d) => d.id !== domain.id));

          toast.success("A domain sikeresen törölve!");
        } else toast.error("Hiba történt a domain törlése közben!");

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
              <Link href={`/domainek/${domain.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Megtekintés
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
                    onClick={handleDelete}
                    isLoading={isPending}
                  >
                    {!isPending && <Trash2 className="size-4" />}
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
