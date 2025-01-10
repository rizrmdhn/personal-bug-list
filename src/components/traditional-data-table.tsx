import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Plus,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import TableRowSkeleton from "./table-row-skeleton";
import { Checkbox } from "./ui/checkbox";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    pages: (number | "...")[];
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  isLoading?: boolean;
  button?: {
    href: string;
    title: string;
    className?: string;
  };
}

const PAGE_SIZES = [10, 20, 30, 40, 50];

export function TraditionalDataTable<TData, TValue>({
  columns,
  data,
  pagination,
  isLoading = false,
  button,
}: DataTableProps<TData, TValue>) {
  // URL State with nuqs
  const [query, setQuery] = useQueryState(
    "query",
    parseAsString.withDefault(""),
  );
  const [, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [, setPageSize] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );
  const [simpleSearch, setSimpleSearch] = useQueryState(
    "simpleSearch",
    parseAsBoolean.withDefault(false),
  );
  const [sortColumn, setSortColumn] = useQueryState("sortBy");
  const [sortOrder, setSortOrder] = useQueryState("sortOrder", {
    defaultValue: "asc",
    parse: (value: string) => value as "asc" | "desc",
    serialize: (value: "asc" | "desc") => value,
  });

  // Convert URL sort state to tanstack table sorting state
  const [sorting, setSorting] = React.useState<SortingState>(() =>
    sortColumn ? [{ id: sortColumn, desc: sortOrder === "desc" }] : [],
  );

  // Handle sorting changes
  const handleSortingChange = React.useCallback(
    (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;
      setSorting(newSorting);
      void (async () => {
        if (newSorting.length > 0 && newSorting[0]?.id) {
          await setSortColumn(newSorting[0].id);
          await setSortOrder(newSorting[0].desc ? "desc" : "asc");
        } else {
          // Keep the last selected column but reset the order
          await setSortColumn(sorting[0]?.id ?? "name");
          await setSortOrder("asc");
        }
      })();
    },
    [setSortColumn, setSortOrder, sorting],
  );

  // Handle page changes
  const handlePageChange = React.useCallback(
    async (newPage: number) => {
      await setPage(newPage);
    },
    [setPage],
  );

  // Handle page size changes
  const handlePageSizeChange = React.useCallback(
    async (newSize: number) => {
      await setPageSize(newSize);
      await setPage(1); // Reset to first page when changing limit
    },
    [setPageSize, setPage],
  );

  // handle search value
  const handleQueryChange = React.useCallback(
    async (query: string) => {
      await setQuery(query);
      await setPage(1);
    },
    [setQuery, setPage],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination.totalPages,
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex w-full items-center justify-between">
          <div className="flex max-w-sm items-center space-x-2">
            <Input
              placeholder="Search..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="h-8"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 lg:px-3"
              onClick={() => handleQueryChange("")}
            >
              Reset
            </Button>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="simpleSearch"
                checked={simpleSearch}
                onCheckedChange={(checked) => setSimpleSearch(!!checked)}
              />
              <label
                htmlFor="simpleSearch"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Simple search
              </label>
            </div>
          </div>
          {button && (
            <Link
              className={cn(
                buttonVariants({ size: "sm" }),
                "h-8",
                button.className,
              )}
              href={button.href}
            >
              <Plus className="h-4 w-4" />
              {button.title}
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "flex cursor-pointer select-none items-center space-x-1"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pagination.limit }).map((_, index) => (
                <TableRowSkeleton key={index} columns={columns.length} />
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
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
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span>Rows per page</span>
            <Select
              value={String(pagination.limit)}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            {pagination.total > 0 ? (
              <>
                {(pagination.currentPage - 1) * pagination.limit + 1}-
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.total,
                )}{" "}
                of {pagination.total}
              </>
            ) : (
              "0 of 0"
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(1)}
            disabled={!pagination.hasPrevPage}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-2">
            {pagination.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page === "..." ? (
                  <div className="px-2">...</div>
                ) : (
                  <Button
                    variant={
                      page === pagination.currentPage ? "default" : "outline"
                    }
                    size="icon"
                    onClick={() => handlePageChange(page as number)}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={!pagination.hasNextPage}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
