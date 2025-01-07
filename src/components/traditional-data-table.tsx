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
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";

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
}

const PAGE_SIZES = [10, 20, 30, 40, 50];

export function TraditionalDataTable<TData, TValue>({
  columns,
  data,
  pagination,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  // URL State with nuqs
  const [, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const [, setPageSize] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
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
          await setSortColumn(null);
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
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
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
