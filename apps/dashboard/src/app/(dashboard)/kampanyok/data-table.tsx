"use client";

import { useEffect, useState, useId, useMemo } from "react";
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
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
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
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  ListFilterIcon,
  CircleXIcon,
  Columns3Icon,
  BarChartBig,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { campaignDataTableAtom, CampaignWithCounts } from "@/store/global";
import { useAtom } from "jotai";
import DotPattern from "@/components/ui/dot-pattern";
import { CampaignStatus } from "@prisma/client";
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
import { campaignStatuses, cn } from "@/lib/utils";

const multiColumnFilterFn: FilterFn<CampaignWithCounts> = (row, columnId, filterValue) => {
  if (!filterValue?.length) return true;
  const searchableRowContent =
    `${row.original.name || ''} ${row.original.status}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

export const CampaignsTable = () => {
  const id = useId();
  const [campaigns, setCampaigns] = useAtom(campaignDataTableAtom);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const { data, isLoading } = api.campaign.getForTable.useQuery(
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

  useEffect(() => {
    if (data?.items) setCampaigns(data.items);
  }, [data, setCampaigns]);

  const filteredCampaigns = useMemo(() => {
    if (!statusFilter.length) return campaigns;

    return campaigns.filter(campaign => {
      return statusFilter.includes(campaign.status);
    });
  }, [campaigns, statusFilter]);

  const handleStatusChange = (checked: boolean, value: string) => {
    setStatusFilter(prev => {
      if (checked) {
        return [...prev, value];
      } else {
        return prev.filter(item => item !== value);
      }
    });
  };

  const handleGlobalFilterChange = (value: string) => {
    setInputValue(value);
    table.setColumnFilters([
      {
        id: "name",
        value: value,
      },
    ]);
  };

  const table = useReactTable({
    data: filteredCampaigns,
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
    pageCount: data?.totalCount ? Math.ceil(data.totalCount / pagination.pageSize) : 0,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
    filterFns: {
      multiColumnFilter: multiColumnFilterFn,
    },
  });

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <div className="relative w-full">
            <Input
              className="bg-white max-w-sm peer ps-9"
              placeholder="Keresés a kampányok között..."
              value={inputValue}
              onChange={(e) => handleGlobalFilterChange(e.target.value)}
              aria-label="Keresés a kampányok között"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <FilterIcon size={16} strokeWidth={2} aria-hidden="true" />
            </div>
            {inputValue && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleGlobalFilterChange("")}
                className="absolute inset-y-0 end-1 size-6"
                aria-label="Keresés törlése"
              >
                <CircleXIcon className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>

          {/* Status filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-1 min-w-[120px]">
                <ListFilterIcon className="size-4" aria-hidden="true" />
                <span>Státusz</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52" align="start">
              <div className="space-y-2">
                {Object.entries(campaignStatuses).map(([key, status]) => (
                  <div
                    key={key}
                    className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`filter-${key}`}
                      checked={statusFilter.includes(key)}
                      onCheckedChange={(checked) =>
                        handleStatusChange(!!checked, key)
                      }
                    />
                    <Label
                      htmlFor={`filter-${key}`}
                      className="flex-1 cursor-pointer flex items-center gap-2"
                    >
                      <div
                        className={cn(
                          "size-2 rounded-full",
                          status.bgColor
                        )}
                      />
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Columns3Icon className="size-4 mr-2" />
              Oszlopok
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
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
                  >
                    {column.id === "name" ? "Név" :
                      column.id === "status" ? "Státusz" :
                        column.id === "contactsCount" ? "Kontaktok" :
                          column.id === "emailsCount" ? "Emailek" :
                            column.id === "updatedAt" ? "Frissítve" :
                              column.id === "actions" ? "Műveletek" :
                                column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : header.column.getCanSort() ? (
              </TableRow>
                  ))
          ) : table.getRowModel().rows.length === 0 ? (
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
                ) : (
            table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                ))
          )}
              </TableBody>
      </Table>
      </div>

      <div className="flex items-center justify-between">
        {/* Page size selector */}
        <div className="flex items-center gap-2 text-sm">
          <p className="text-muted-foreground">Találatok száma:</p>
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
        </SelectItem>
              ))}
      </SelectContent>
    </Select>
        </div >

  {/* Page number information */ }
  < div className = "text-muted-foreground flex grow justify-end text-sm whitespace-nowrap" >
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
        </ >

  {/* Pagination buttons */ }
  < div >
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
        </ >
      </div >
    </div >
  );
};
