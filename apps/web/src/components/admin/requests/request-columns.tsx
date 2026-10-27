import type { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { RequestStatusBadge } from "@/components/admin/requests/request-status-badge";
import {
  DataTableEntityCell,
  DataTableSortableHeader,
  getExpandColumn,
  getSelectColumn,
  multiValueFilter,
} from "@/components/data-table/data-table-column-helpers";
import { Button } from "@/components/ui/button";
import {
  type AdminRequest,
  formatRequestDate,
  getRequestSubject,
} from "@/hooks/use-admin-requests";
import { getInitials } from "@/lib/utils";

export const requestColumnLabels: Record<string, string> = {
  subject: "Subject",
  type: "Type",
  action: "Action",
  status: "Status",
  association: "Association",
  requestedBy: "Requested By",
  createdAt: "Created",
};

export interface RequestReviewActionsProps {
  request: AdminRequest;
  onApprove: (request: AdminRequest) => void;
  onReject: (request: AdminRequest) => void;
}

export function RequestReviewActions({
  request,
  onApprove,
  onReject,
}: RequestReviewActionsProps) {
  if (request.status !== "Pending") return null;

  return (
    <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
      <Button
        variant="outline"
        size="icon-xs"
        className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/10"
        onClick={() => onApprove(request)}
        aria-label="Approve"
        title="Approve"
      >
        <Check className="size-3" />
      </Button>
      <Button
        variant="outline"
        size="icon-xs"
        className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50/10"
        onClick={() => onReject(request)}
        aria-label="Reject"
        title="Reject"
      >
        <X className="size-3" />
      </Button>
    </div>
  );
}

export interface GetRequestColumnsProps {
  onApprove: (request: AdminRequest) => void;
  onReject: (request: AdminRequest) => void;
}

export function getRequestColumns({
  onApprove,
  onReject,
}: GetRequestColumnsProps): ColumnDef<AdminRequest>[] {
  return [
    getSelectColumn<AdminRequest>(),
    getExpandColumn<AdminRequest>(),
    {
      id: "subject",
      accessorFn: (row) => getRequestSubject(row),
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Subject" />
      ),
      cell: ({ row }) => {
        const subject = getRequestSubject(row.original);
        return (
          <DataTableEntityCell
            name={subject}
            initials={getInitials(subject, "R")}
          />
        );
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground">
          {row.original.type}
        </span>
      ),
      filterFn: multiValueFilter<AdminRequest>(),
    },
    {
      accessorKey: "action",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Action" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.action}
        </span>
      ),
      filterFn: multiValueFilter<AdminRequest>(),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <RequestStatusBadge status={row.original.status} />,
      filterFn: multiValueFilter<AdminRequest>(),
    },
    {
      id: "association",
      accessorFn: (row) =>
        row.targetAssociation?.acronym || row.targetAssociation?.name || "",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Association" />
      ),
      cell: ({ getValue }) => (
        <span className="text-xs font-medium text-foreground">
          {(getValue() as string) || "—"}
        </span>
      ),
    },
    {
      id: "requestedBy",
      accessorFn: (row) => row.requestedBy?.name ?? "",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Requested By" />
      ),
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {(getValue() as string) || "Deleted user"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatRequestDate(row.original.createdAt)}
        </span>
      ),
      enableGlobalFilter: false,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RequestReviewActions
          request={row.original}
          onApprove={onApprove}
          onReject={onReject}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
