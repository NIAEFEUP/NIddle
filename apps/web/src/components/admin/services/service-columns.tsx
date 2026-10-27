import type { ColumnDef } from "@tanstack/react-table";
import {
  DataTableEntityCell,
  DataTableSortableHeader,
  getActionsColumn,
  getExpandColumn,
  getSelectColumn,
  multiValueFilter,
} from "@/components/data-table/data-table-column-helpers";
import type { AdminService } from "@/hooks/use-admin-services";
import { getInitials } from "@/lib/utils";

export const serviceColumnLabels: Record<string, string> = {
  name: "Name",
  association: "Association",
  scope: "Faculty / Course",
  location: "Location",
  email: "Email",
  phoneNumber: "Phone",
  schedule: "Schedule",
};

export function getServiceAssociationLabel(service: AdminService): string {
  return service.createdBy?.acronym || service.createdBy?.name || "";
}

export function getServiceScopeLabel(service: AdminService): string {
  const scope = service.faculty ?? service.course;
  return scope?.acronym || scope?.name || "";
}

export function formatScheduleSummary(service: AdminService): string {
  const count = service.schedule?.length ?? 0;
  if (count === 0) return "No hours set";
  return `${count} ${count === 1 ? "time slot" : "time slots"}`;
}

export interface GetServiceColumnsProps {
  onEdit: (service: AdminService) => void;
  onDelete: (service: AdminService) => void;
}

export function getServiceColumns({
  onEdit,
  onDelete,
}: GetServiceColumnsProps): ColumnDef<AdminService>[] {
  return [
    getSelectColumn<AdminService>(),
    getExpandColumn<AdminService>(),
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <DataTableEntityCell
          name={row.original.name}
          initials={getInitials(row.original.name, "S")}
        />
      ),
    },
    {
      id: "association",
      accessorFn: (row) => row.createdBy?.id ?? "",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Association" />
      ),
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground">
          {getServiceAssociationLabel(row.original) || "—"}
        </span>
      ),
      sortingFn: (a, b) =>
        getServiceAssociationLabel(a.original).localeCompare(
          getServiceAssociationLabel(b.original),
        ),
      filterFn: multiValueFilter<AdminService>(),
      enableGlobalFilter: false,
    },
    {
      id: "scope",
      accessorFn: (row) => row.faculty?.id ?? row.course?.id ?? "",
      header: "Faculty / Course",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground">
          {getServiceScopeLabel(row.original) || "—"}
          {row.original.course && (
            <span className="ml-1 text-muted-foreground font-normal">
              (course)
            </span>
          )}
        </span>
      ),
      filterFn: multiValueFilter<AdminService>(),
      enableSorting: false,
      enableGlobalFilter: false,
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Location" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.location || "—"}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.email || "—"}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {row.original.phoneNumber || "—"}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: "schedule",
      accessorFn: (row) => row.schedule?.length ?? 0,
      header: "Schedule",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatScheduleSummary(row.original)}
        </span>
      ),
      enableSorting: false,
      enableGlobalFilter: false,
    },
    getActionsColumn<AdminService>({ onEdit, onDelete }),
  ];
}
