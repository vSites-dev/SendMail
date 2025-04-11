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
  Search,
} from "lucide-react";
import {
  ColumnFiltersState,
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
import { cn, emailStatuses } from "@/lib/utils";

export const EmailsTable = () => {
  const id = useId();
  const [emails, setEmails] = useAtom(emailDataTableAtom);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "sentAt", desc: true },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [campaignFilter, setCampaignFilter] = useState<string[]>([]);
  const [campaignSearchValue, setCampaignSearchValue] = useState("");

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

  useEffect(() => {
    if (data?.items) setEmails(data.items);
  }, [data, setEmails]);

  const filteredEmails = useMemo(() => {
    let filtered = emails;

    if (statusFilter.length) {
      filtered = filtered.filter((email) =>
        statusFilter.includes(email.status),
      );
    }

    if (campaignFilter.length) {
      filtered = filtered.filter(
        (email) =>
          email.campaignId && campaignFilter.includes(email.campaignId),
      );
    }

    return filtered;
  }, [emails, statusFilter, campaignFilter]);

  const table = useReactTable({
    data: filteredEmails,
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
    pageCount: Math.ceil((data?.totalCount || 0) / pagination.pageSize),
    state: {
      columnFilters,
      columnVisibility,
      pagination,
      sorting,
    },
  });

  const handleStatusChange = (checked: boolean, value: string) => {
    setStatusFilter((prev) => {
      if (checked) {
        if (!prev.includes(value)) return [...prev, value];
      } else return prev.filter((status) => status !== value);
      return prev;
    });
  };

  const handleGlobalFilterChange = (value: string) => {
    setInputValue(value);
    table.setGlobalFilter(value);
  };

  const handleCampaignChange = (checked: boolean, campaignId: string) => {
    setCampaignFilter((prev) => {
      if (checked) {
        if (!prev.includes(campaignId)) return [...prev, campaignId];
      } else return prev.filter((id) => id !== campaignId);
      return prev;
    });
  };

  const filteredCampaignOptions = useMemo(() => {
    const uniqueCampaigns = new Map();

    emails.forEach((email) => {
      if (email.campaign) {
        if (
          !campaignSearchValue ||
          email.campaign.name
            .toLowerCase()
            .includes(campaignSearchValue.toLowerCase())
        ) {
          uniqueCampaigns.set(email.campaign.id, email.campaign);
        }
      }
    });

    return Array.from(uniqueCampaigns.values());
  }, [emails, campaignSearchValue]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-fit">
            <Input
              id={`${id}-input`}
              className={cn(
                "peer min-w-60 ps-9",
                Boolean(table.getColumn("subject")?.getFilterValue()) && "pe-9",
              )}
              value={inputValue}
              onChange={(e) => handleGlobalFilterChange(e.target.value)}
              placeholder="Keresés tárgy alapján..."
              type="text"
              aria-label="Keresés tárgy alapján"
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

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-fit">
                <FilterIcon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Státusz
                {statusFilter.length > 0 && (
                  <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {statusFilter.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto min-w-36 p-3" align="start">
              <div className="space-y-3">
                <div className="text-muted-foreground text-xs font-medium">
                  Státusz szűrők
                </div>
                <div className="space-y-3">
                  {Object.keys(emailStatuses).map((value, i) => (
                    <div
                      key={value + i.toString()}
                      className="flex items-center gap-3 py-1"
                    >
                      <Checkbox
                        id={id + "-" + value}
                        checked={statusFilter.includes(value)}
                        onCheckedChange={(checked: boolean) =>
                          handleStatusChange(checked, value)
                        }
                      />
                      <Label
                        htmlFor={id + "-" + value}
                        className="flex cursor-pointer grow items-center font-normal"
                      >
                        <span
                          className={cn(
                            "mr-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                            emailStatuses[value]?.bgColor,
                          )}
                        />
                        {emailStatuses[value]?.label || value}
                      </Label>
                      <div className="flex-1 text-right ml-2">
                        <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium text-right">
                          {campaignFilter.length > 0
                            ? emails.filter(
                              (email) =>
                                email.status === value &&
                                email.campaignId &&
                                campaignFilter.includes(email.campaignId),
                            ).length
                            : emails.filter((email) => email.status === value)
                              .length}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-fit">
                <FilterIcon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Kampányok
                {campaignFilter.length > 0 && (
                  <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                    {campaignFilter.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-3" align="start">
              <div className="space-y-3">
                <div className="text-muted-foreground text-xs font-medium">
                  Kampány szűrő
                </div>
                <div className="relative">
                  <Input
                    placeholder="Kampány keresése..."
                    className="w-full ps-9"
                    value={campaignSearchValue}
                    onChange={(e) => setCampaignSearchValue(e.target.value)}
                  />
                  <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                    <Search size={16} aria-hidden="true" />
                  </div>
                  {campaignSearchValue && (
                    <button
                      className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Keresés törlése"
                      onClick={() => setCampaignSearchValue("")}
                    >
                      <CircleXIcon size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {filteredCampaignOptions.length > 0 ? (
                    filteredCampaignOptions?.map(
                      (campaign) =>
                        campaign && (
                          <div
                            key={campaign.id}
                            className="flex items-center gap-3 py-1"
                          >
                            <Checkbox
                              id={id + "-campaign-" + campaign.id}
                              checked={campaignFilter.includes(
                                campaign.id || "",
                              )}
                              onCheckedChange={(checked: boolean) =>
                                handleCampaignChange(checked, campaign.id || "")
                              }
                            />
                            <Label
                              htmlFor={id + "-campaign-" + campaign.id}
                              className="flex cursor-pointer text-sm grow items-center font-normal truncate"
                            >
                              {campaign.name || ""}
                            </Label>
                            <div className="flex-1 text-right ml-2">
                              <span className="bg-background text-muted-foreground/70 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium text-right">
                                {emails
                                  .filter((e) => e.campaign?.id === campaign.id)
                                  .filter(
                                    (e) =>
                                      statusFilter.length === 0 ||
                                      statusFilter.includes(e.status),
                                  ).length || 0}
                              </span>
                            </div>
                          </div>
                        ),
                    )
                  ) : (
                    <div className="text-muted-foreground text-center py-2">
                      Nincs találat
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-fit">
                <Columns3Icon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Nézet
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="p-2 text-muted-foreground text-xs font-medium">
                Oszlopok megjelenítése
              </div>
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
                      onSelect={(event) => event.preventDefault()}
                    >
                      {column.columnDef.header as string}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="bg-white overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-11">
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                            "flex h-full cursor-pointer items-center gap-2 select-none",
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
                            header.getContext(),
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
                          header.getContext(),
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

      <div className="flex items-center justify-between gap-8">
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
                data?.totalCount || 0,
              )}
            </span>{" "}
            / <span className="text-foreground">{data?.totalCount || 0}</span>
          </p>
        </div>

        <div>
          <Pagination>
            <PaginationContent>
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
