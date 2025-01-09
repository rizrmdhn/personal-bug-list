import DataTableActionCell from "@/components/data-table-action-cell";
import { globalErrorToast, globalSuccessToast } from "@/lib/toast";
import { api } from "@/trpc/react";
import { type SelectApplication } from "@/types/applications.types";
import { type ColumnDef, type Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { Ban, Check, Trash, Undo2 } from "lucide-react";

const ActionCell = ({ row }: { row: Row<SelectApplication> }) => {
  const utils = api.useUtils();

  const enableMutation = api.applications.enable.useMutation({
    onSuccess: () => {
      globalSuccessToast("Application enabled successfully");

      utils.applications.paginate.invalidate();
    },
    onError: (error) => {
      globalErrorToast(error.message);
    },
  });

  const disableMutation = api.applications.disable.useMutation({
    onSuccess: () => {
      globalSuccessToast("Application disabled successfully");

      utils.applications.paginate.invalidate();
    },
    onError: (error) => {
      globalErrorToast(error.message);
    },
  });

  const revokeMutation = api.applications.revoke.useMutation({
    onSuccess: () => {
      globalSuccessToast("Application revoked successfully");

      utils.applications.paginate.invalidate();
    },
    onError: (error) => {
      globalErrorToast(error.message);
    },
  });

  const undoRevokeMutation = api.applications.undoRevoke.useMutation({
    onSuccess: () => {
      globalSuccessToast("Application revoked successfully");

      utils.applications.paginate.invalidate();
    },
    onError: (error) => {
      globalErrorToast(error.message);
    },
  });

  const deleteMutation = api.applications.delete.useMutation({
    onSuccess: () => {
      globalSuccessToast("Application deleted successfully");

      utils.applications.paginate.invalidate();
    },
    onError: (error) => {
      globalErrorToast(error.message);
    },
  });

  const isLoading =
    revokeMutation.isPending ||
    undoRevokeMutation.isPending ||
    deleteMutation.isPending ||
    enableMutation.isPending ||
    disableMutation.isPending;

  return (
    <DataTableActionCell
      isLoading={isLoading}
      actionMenu={[
        {
          icon: row.original.isActive ? <Ban /> : <Check />,
          text: row.original.isActive ? "Disable" : "Enable",
          triggerText: row.original.isActive ? "Disable" : "Enable",
          type: "dialog",
          dialogConfig: {
            title: row.original.isActive
              ? "Disable Application"
              : "Enable Application",
            description: row.original.isActive
              ? "Are you sure you want to disable this application?"
              : "Are you sure you want to enable this application?",
            onConfirm: async () => {
              if (row.original.isActive) {
                await disableMutation.mutateAsync({ id: row.original.id });
              } else {
                await enableMutation.mutateAsync({ id: row.original.id });
              }
            },
          },
        },
        {
          icon: <Undo2 />,
          text: row.original.isRevoked ? "Undo Revoke" : "Revoke",
          triggerText: row.original.isRevoked ? "Undo Revoke" : "Revoke",
          type: "dialog",
          dialogConfig: {
            title: row.original.isRevoked
              ? "Undo Revoke"
              : "Revoke Application",
            description: row.original.isRevoked
              ? "Are you sure you want to undo revoke this application?"
              : "Are you sure you want to revoke this application?",
            onConfirm: async () => {
              if (row.original.isRevoked) {
                await undoRevokeMutation.mutateAsync({ id: row.original.id });
              } else {
                await revokeMutation.mutateAsync({ id: row.original.id });
              }
            },
          },
        },
        {
          icon: <Trash />,
          text: "Delete",
          triggerText: "Delete",
          type: "dialog",
          className: "text-red-600 focus:bg-red-500 focus:text-white",
          dialogConfig: {
            title: "Delete Application",
            description: "Are you sure you want to delete this application?",
            onConfirm: async () => {
              await deleteMutation.mutateAsync({ id: row.original.id });
            },
          },
        },
      ]}
    />
  );
};

export const columns: ColumnDef<SelectApplication>[] = [
  {
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
  {
    accessorKey: "action",
    header: "Action",
    cell: ActionCell,
  },
];
