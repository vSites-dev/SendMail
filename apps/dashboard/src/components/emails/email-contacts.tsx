"use client";

import { useEffect, useState } from "react";
import { Contact } from "@prisma/client";
import {
  Mail,
  Search,
  Settings2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { columns } from "../campaigns/columns";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { selectedEmailContactsAtom } from "@/store/global";

export function EmailContacts({ contacts }: { contacts: Contact[] }) {
  const [tableContacts, setTableContacts] = useState(contacts);
  const [selectedContacts, setSelectedContacts] = useAtom(
    selectedEmailContactsAtom,
  );

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    if (contacts.length > 0) {
      setTableContacts(contacts);
    }
  }, [contacts]);

  const table = useReactTable({
    data: tableContacts,
    columns,
    state: {
      globalFilter,
      columnVisibility,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    const rows = table.getRowModel().rows;

    rows.forEach((row) => {
      const isSelected = selectedContacts.includes(row.original.id);
      if (row.getIsSelected() !== isSelected) {
        row.toggleSelected(isSelected);
      }
    });
  }, [selectedContacts, table, tableContacts]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-neutral-700">
          Kontaktok kiválasztása
        </h2>
      </div>
      <div className="w-full space-y-4">
        <div className="space-y-4 w-full">
          <div className="flex justify-between items-center">
            <div className="relative w-full">
              <Input
                className="bg-white max-w-sm peer ps-9"
                placeholder="Keresés a kontaktok között..."
                type="text"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <Search size={16} strokeWidth={2} aria-hidden="true" />
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="mt-1">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Oszlopok
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .filter(
                    (column) =>
                      column.columnDef.header &&
                      column.columnDef.header.length > 2,
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.columnDef.header as string}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {tableContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border">
              <Mail className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Nincsenek kontaktok</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Még nincsenek kontaktjaid. Adj hozzá néhányat a kezdéshez.
              </p>
            </div>
          ) : (
            <div className="rounded-md shadow-sm border overflow-hidden">
              <Table className="">
                <TableHeader className="bg-neutral-100 text-neutral-900">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {header.isPlaceholder ? null : (
                            <div className="flex cursor-pointer items-center space-x-1">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}

                              {header.column.getIsSorted() === "asc" && (
                                <ChevronUp className="size-4 ml-1" />
                              )}
                              {header.column.getIsSorted() === "desc" && (
                                <ChevronDown className="size-4 ml-1" />
                              )}

                              {header.column.getCanSort() &&
                                !header.column.getIsSorted() && (
                                  <ChevronsUpDown className="size-4 ml-1 opacity-50" />
                                )}
                            </div>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody className="bg-white">
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        onClick={() => {
                          const contactId = row.original.id;
                          setSelectedContacts((prev) =>
                            prev.includes(contactId)
                              ? prev.filter((id) => id !== contactId)
                              : [...prev, contactId],
                          );
                        }}
                        className="cursor-pointer"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Nincsen találat...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {tableContacts.length > 0 && (
            <div className="flex items-center justify-end space-x-2 pb-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {selectedContacts.length} / {tableContacts.length} kiválasztva
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
