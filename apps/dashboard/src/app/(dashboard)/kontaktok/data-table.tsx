"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { api } from "@/trpc/react";
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
import { Search, Settings2, ArrowUp, ArrowDown, BarChartBig, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { contactDataTableAtom } from "@/store/global";
import { useAtom } from "jotai";
import DotPattern from "@/components/ui/dot-pattern";

export const ContactsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);

  const [contacts, setContacts] = useAtom(contactDataTableAtom);

  const { data, isLoading } = api.contact.getForTable.useQuery({
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  });

  useEffect(() => {
    if (
      data?.totalCount &&
      data.totalCount > 0 &&
      data.totalCount !== totalCount
    ) {
      setTotalPages(Math.ceil(data.totalCount / pageSize));
      setTotalCount(data.totalCount);
    }
  }, [data, totalPages, pageSize]);

  useEffect(() => {
    if (data?.items) setContacts(data.items);
  }, [data]);

  const table = useReactTable({
    data: contacts,
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

  return (
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
                  column.columnDef.header && column.columnDef.header.length > 2,
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

      <div className="rounded-md shadow-sm border overflow-hidden">
        <Table>
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

                        {header.column.getCanSort() && !header.column.getIsSorted() && (
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
            {isLoading ? (
              [...Array(10)].map((_, idx) => (
                <TableRow key={idx}>
                  {columns.map((_, colIdx) => (
                    <TableCell key={colIdx}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
            ) :
              totalCount !== 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Nincs találat.
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="p-0 relative h-[250px] overflow-hidden">
                    <DotPattern
                      width={6}
                      height={6}
                      cx={1}
                      cy={1}
                      cr={1}
                      className="opacity-20"
                    />
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                      <BarChartBig className="mb-2 size-8 text-muted-foreground" />
                      <p className="text-base text-neutral-700 font-semibold">
                        Nincs megjeleníthető adat
                      </p>
                      <p className="text-xs max-w-[250px] mt-2 text-center text-muted-foreground opacity-80">
                        Ha valami probléma akadt akkor keressen fel minket.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )
            }
          </TableBody>
        </Table>
      </div>

      <div className="flex w-full justify-between items-center">
        <p className="text-muted-foreground text-sm w-full">
          {totalCount} kontakt
        </p>

        <Pagination className="w-full">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, idx) => {
              const page = idx + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}
            <PaginationItem>
              <PaginationNext
                isActive={currentPage === totalPages || totalPages === 0}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className={
                  (currentPage === totalPages || totalPages === 0)
                    ? "pointer-events-none opacity-50 !bg-transparent border-none"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="w-full text-right text-muted-foreground text-sm">
          {totalPages} oldal
        </div>
      </div>
    </div>
  );
};
