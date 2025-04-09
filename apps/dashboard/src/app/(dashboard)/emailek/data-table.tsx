"use client";

import { useEffect, useState, useId, useMemo } from "react";
import { api } from "@/trpc/react";
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
  PaginationItem,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChartBig,
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleXIcon,
  Columns3Icon,
  FilterIcon,
  ListFilterIcon,
} from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
  PaginationState,
  getFacetedUniqueValues,
} from "@tanstack/react-table";
import { columns } from "./columns";
import { emailDataTableAtom } from "@/store/global";
import { useAtom } from "jotai";
import DotPattern from "@/components/ui/dot-pattern";
import { Email, EmailStatus } from "@prisma/client";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Email statuses for filtering
const emailStatuses: Record<string, { label: string; color: string }> = {
  DELIVERED: { label: "Kézbesítve", color: "green" },
  OPENED: { label: "Megnyitva", color: "blue" },
  SENT: { label: "Elküldve", color: "yellow" },
  PENDING: { label: "Függőben", color: "orange" },
  FAILED: { label: "Sikertelen", color: "red" },
  SCHEDULED: { label: "Ütemezve", color: "purple" },
};

const multiColumnFilterFn: FilterFn<Email> = (row, columnId, filterValue) => {
  if (!filterValue?.length) return true;
  const searchableRowContent =
    `${row.original.subject || ''} ${row.original.from || ''}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

const statusFilterFn: FilterFn<Email> = (
  row,
  columnId,
  filterValue: string[]
) => {
  if (!filterValue?.length) return true;
  const status = row.getValue(columnId) as string;
  return filterValue.includes(status);
};

export const EmailsTable = () => {
  const id = useId();
  const [emails, setEmails] = useAtom(emailDataTableAtom);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [inputValue, setInputValue] = useState("");

  // Use TanStack table's pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "sentAt", desc: true },
  ]);

  const uniqueStatusValues = useMemo(() => {
    return Object.keys(emailStatuses) as EmailStatus[];
  }, []);

  const { data, isLoading } = api.email.getForTable.useQuery(
    {
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  );

  const table = useReactTable({
    data: emails,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    pageCount: data?.totalCount
      ? Math.ceil(data.totalCount / pagination.pageSize)
      : 0,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
    filterFns: {
      multiColumnFilter: multiColumnFilterFn,
      statusFilter: statusFilterFn,
    },
  });

  useEffect(() => {
    if (data?.items) setEmails(data.items);
  }, [data, setEmails]);



  // Handle status filter changes
  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index !== -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table
      .getColumn("status")
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  // Handle subject/email search
  const handleGlobalFilterChange = (value: string) => {
    setInputValue(value);
    table.getColumn("subject")?.setFilterValue(value);
  };


  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Filter by subject or email */}
          <div className="relative">
            <Input
              id={`${id}-input`}
              className={cn(
                "peer min-w-60 ps-9",
                Boolean(table.getColumn("subject")?.getFilterValue()) && "pe-9"
              )}
              value={inputValue}
              onChange={(e) => handleGlobalFilterChange(e.target.value)}
              placeholder="Keresés tárgy vagy email alapján..."
              type="text"
              aria-label="Keresés tárgy vagy email alapján"
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              <ListFilterIcon size={16} aria-hidden="true" />
            </div>
            {Boolean(table.getColumn("subject")?.getFilterValue()) && (
              <button
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Keresés törlése"
                onClick={() => {
                  handleGlobalFilterChange("");
                }}
              >
                <CircleXIcon size={16} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Filter by status */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <FilterIcon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Státusz
                {(() => {
                  const filterValue = table.getColumn("status")?.getFilterValue();
                  if (filterValue && Array.isArray(filterValue) && filterValue.length > 0) {
                    return (
                      <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                        {filterValue.length}
                      </span>
                    );
                  }
                  return null;
                })()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto min-w-36 p-3" align="start">
              <div className="space-y-3">
                <div className="text-muted-foreground text-xs font-medium">
                  Szűrők
                </div>
                <div className="space-y-3">
                  {uniqueStatusValues.map((value, i) => {
                    const filterValue = table.getColumn("status")?.getFilterValue() as string[];
                    const checked = filterValue ? filterValue.includes(value) : false;

                    return (
                      <div
                        key={value + i.toString()}
                        className="flex items-center space-x-2 py-1"
                      >
                        <Checkbox
                          id={id + "-" + value}
                          checked={checked}
                          onCheckedChange={(checked) => {
                            handleStatusChange(checked as boolean, value);
                          }}
                        />
                        <Label
                          htmlFor={id + "-" + value}
                          className="text-sm font-normal flex items-center"
                        >
                          <span
                            className={cn(
                              "mr-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                              value === "DELIVERED" && "bg-green-500",
                              value === "SENT" && "bg-yellow-500",
                              value === "FAILED" && "bg-red-500",
                            )}
                          />
                          {emailStatuses[value]?.label || value}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Toggle columns visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns3Icon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Nézet
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Oszlopok megjelenítése</DropdownMenuLabel>
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
                      onSelect={(event) => event.preventDefault()}
                    >
                      {column.id === "campaign" ? "Kampány" :
                        column.id === "subject" ? "Tárgy" :
                          column.id === "contact" ? "Címzett" :
                            column.id === "status" ? "Státusz" :
                              column.id === "sentAt" ? "Küldés ideje" :
                                column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="bg-background overflow-hidden rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="h-11"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                            "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (
                              header.column.getCanSort() &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: (
                              <ChevronUpIcon
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ChevronDownIcon
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={columns.length} className="h-16">
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="last:py-0">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="p-0 relative h-[250px] overflow-hidden"
                >
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
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-8">
        {/* Results per page */}
        <div className="flex items-center gap-3">
          <Label htmlFor={id} className="max-sm:sr-only">
            Találatok oldalanként
          </Label>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger id={id} className="w-fit whitespace-nowrap">
              <SelectValue placeholder="Találatok száma" />
            </SelectTrigger>
            <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
              {[5, 10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page number information */}
        <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
          <p
            className="text-muted-foreground text-sm whitespace-nowrap"
            aria-live="polite"
          >
            <span className="text-foreground">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                (data?.items && data.items.length > 0 ? 1 : 0)}
              -
              {Math.min(
                table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                (data?.items?.length || 0),
                data?.totalCount || 0
              )}
            </span>{" "}
            / {" "}
            <span className="text-foreground">
              {data?.totalCount || 0}
            </span>
          </p>
        </div>

        {/* Pagination buttons */}
        <div>
          <Pagination>
            <PaginationContent>
              {/* First page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Első oldalra ugrás"
                >
                  <ChevronFirstIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Previous page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Előző oldalra ugrás"
                >
                  <ChevronLeftIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Next page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Következő oldalra ugrás"
                >
                  <ChevronRightIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
              {/* Last page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Utolsó oldalra ugrás"
                >
                  <ChevronLastIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};
