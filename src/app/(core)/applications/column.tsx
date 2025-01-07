import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { type SelectApplication } from "@/types/applications.types";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const columns: ColumnDef<SelectApplication>[] = [
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No" />
    ),
    accessorKey: "No",
    accessorFn: (_, rowIndex) => rowIndex + 1,
    id: "No",
    sortingFn: "basic",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "key",
    header: "API Key",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={row.original.isActive ? "text-green-600" : "text-red-600"}
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => format(new Date(row.original.createdAt), "PP"),
  },
];
