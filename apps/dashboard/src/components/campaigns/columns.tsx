import type { ColumnDef } from "@tanstack/react-table";
import { Contact } from "@prisma/client";
import { cn, contactStatuses } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useAtom } from "jotai";
import { selectedCampaignContactsAtom } from "@/store/global";

export const columns: ColumnDef<Contact>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const [selectedContacts, setSelectedContacts] = useAtom(
        selectedCampaignContactsAtom
      );

      return (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            const pageRowIds = table.getRowModel().rows.map(
              (row) => row.original.id
            );

            if (value) {
              const newSelectedIds = [
                ...selectedContacts,
                ...pageRowIds.filter((id) => !selectedContacts.includes(id))
              ];
              setSelectedContacts(newSelectedIds);
            } else {
              const newSelectedIds = selectedContacts.filter(
                (id) => !pageRowIds.includes(id)
              );
              setSelectedContacts(newSelectedIds);
            }

            table.toggleAllPageRowsSelected(!!value);
          }}
          aria-label="Összes kiválasztása"
          className=""
        />
      );
    },
    cell: ({ row }) => {
      const [selectedContacts, setSelectedContacts] = useAtom(
        selectedCampaignContactsAtom
      );
      const isSelected = selectedContacts.includes(row.original.id);

      return (
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            const newSelectedContacts = checked
              ? [...selectedContacts, row.original.id]
              : selectedContacts.filter((id) => id !== row.original.id);

            setSelectedContacts(newSelectedContacts);
            row.toggleSelected(!!checked);
          }}
          aria-label="Kiválasztás"
          className=""
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email cím",
    enableSorting: true,
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
      return (
        <div className="flex items-center">
          <div
            className={cn(
              "w-2 h-2 rounded-full mr-2",
              contactStatuses[row.original.status].bgColor
            )}
          ></div>
          {contactStatuses[row.original.status].label}
        </div>
      );
    },
  }
];
