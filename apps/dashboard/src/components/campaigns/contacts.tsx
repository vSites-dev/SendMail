"use client";

import { useEffect, useState } from "react";
import { Contact } from "@prisma/client";
import { Mail, Search, Settings2, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
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
import { columns } from "./columns";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { campaignContactsDataTableAtom, selectedCampaignContactsAtom } from "@/store/global";
import { useAtom } from "jotai";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink
} from "@/components/ui/pagination";

export function CampaignContacts({ contacts }: { contacts: Contact[] }) {
  const [tableContacts, setTableContacts] = useAtom(campaignContactsDataTableAtom);
  const [selectedContacts, setSelectedContacts] = useAtom(selectedCampaignContactsAtom);

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (contacts.length > 0) {
      setTableContacts(contacts);
    }
  }, [contacts, setTableContacts]);

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

    rows.forEach(row => {
      const isSelected = selectedContacts.includes(row.original.id);
      if (row.getIsSelected() !== isSelected) {
        row.toggleSelected(isSelected);
      }
    });
  }, [selectedContacts, table, tableContacts]);

  const totalPages = Math.ceil(table.getFilteredRowModel().rows.length / pageSize);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-700">
          Kontaktok kiválasztása
        </h2>
      </div>

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
            <div className="">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Előző
                    </Button>
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    const isCurrentPage = pageNumber === table.getState().pagination.pageIndex + 1;

                    return (
                      <PaginationItem className="mx-1" key={index}>
                        <PaginationLink
                          onClick={() => table.setPageIndex(index)}
                          isActive={isCurrentPage}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="gap-1"
                    >
                      Következő
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}
