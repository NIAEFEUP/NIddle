import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, Check, Clock, Eye, Layers, Trash2, X } from "lucide-react";
import {
  getRequestSubtitle,
  getRequestTitle,
  type RequestItem,
} from "@/components/admin/requests/request-types";
import { InitialsAvatar } from "@/components/common/initials-avatar";
import {
  DataTableSortableHeader,
  getSelectColumn,
} from "@/components/data-table/data-table-column-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getInitials } from "@/lib/utils";

export const requestColumnLabels: Record<string, string> = {
  title: "Resource",
  type: "Type",
  action: "Action",
  targetAssociation: "Association",
  requestedBy: "Requester",
  status: "Status",
  createdAt: "Submitted",
};

export interface GetRequestColumnsProps {
  onViewDetails: (request: RequestItem) => void;
  onApprove: (request: RequestItem) => void;
  onReject: (request: RequestItem) => void;
  onDelete: (request: RequestItem) => void;
}

export function getRequestColumns({
  onViewDetails,
  onApprove,
  onReject,
  onDelete,
}: GetRequestColumnsProps): ColumnDef<RequestItem>[] {
  return [
    getSelectColumn<RequestItem>(),
    {
      id: "title",
      accessorFn: (row) => getRequestTitle(row),
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Resource" />
      ),
      cell: ({ row }) => {
        const title = getRequestTitle(row.original);
        const subtitle = getRequestSubtitle(row.original);
        const initials = getInitials(title, "R");

        return (
          <button
            type="button"
            className="flex items-center gap-3 font-medium text-foreground text-sm py-1.5 cursor-pointer group text-left"
            onClick={() => onViewDetails(row.original)}
          >
            <InitialsAvatar initials={initials} size="sm" />
            <div className="flex flex-col">
              <span className="font-medium group-hover:text-primary transition-colors">
                {title}
              </span>
              {subtitle && (
                <span className="text-xs text-muted-foreground">
                  {subtitle}
                </span>
              )}
            </div>
          </button>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge variant="secondary" className="gap-1 font-medium text-[11px]">
            {type === "Event" ? (
              <Calendar className="size-3" />
            ) : (
              <Layers className="size-3" />
            )}
            {type}
          </Badge>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true;
        if (Array.isArray(filterValue)) {
          if (filterValue.length === 0 || filterValue.includes("all"))
            return true;
          return filterValue.includes(row.original.type);
        }
        return row.original.type === filterValue;
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const action = row.original.action;
        const colorClass =
          action === "Create"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : action === "Update Existing"
              ? "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
              : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";

        return (
          <Badge
            variant="outline"
            className={`${colorClass} font-medium text-[11px]`}
          >
            {action}
          </Badge>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true;
        if (Array.isArray(filterValue)) {
          if (filterValue.length === 0 || filterValue.includes("all"))
            return true;
          return filterValue.includes(row.original.action);
        }
        return row.original.action === filterValue;
      },
    },
    {
      id: "targetAssociation",
      accessorFn: (row) =>
        row.targetAssociation?.acronym || row.targetAssociation?.name || "",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Association" />
      ),
      cell: ({ row }) => {
        const assoc = row.original.targetAssociation;
        if (!assoc) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }
        const label = assoc.acronym || assoc.name;
        const initials = getInitials(label, "A");

        return (
          <div className="flex items-center gap-2">
            <InitialsAvatar initials={initials} size="sm" />
            <span className="text-xs font-medium text-foreground">{label}</span>
          </div>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true;
        const assocId = row.original.targetAssociation?.id;
        if (!assocId) return false;
        if (Array.isArray(filterValue)) {
          if (filterValue.length === 0 || filterValue.includes("all"))
            return true;
          return filterValue.includes(String(assocId));
        }
        return String(assocId) === String(filterValue);
      },
    },
    {
      id: "requestedBy",
      accessorFn: (row) => row.requestedBy?.name || "",
      header: "Requester",
      cell: ({ row }) => {
        const user = row.original.requestedBy;
        if (!user) {
          return <span className="text-xs text-muted-foreground">System</span>;
        }
        const initials = getInitials(user.name, "U");

        return (
          <div className="flex items-center gap-2">
            <InitialsAvatar initials={initials} size="sm" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">
                {user.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const isPending = status === "Pending";
        const isApproved = status === "Approved";

        const badgeClass = isPending
          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : isApproved
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";

        return (
          <Badge
            variant="outline"
            className={`${badgeClass} gap-1 font-medium text-[11px]`}
          >
            {isPending && <Clock className="size-3" />}
            {isApproved && <Check className="size-3" />}
            {!isPending && !isApproved && <X className="size-3" />}
            {status}
          </Badge>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true;
        if (Array.isArray(filterValue)) {
          if (filterValue.length === 0 || filterValue.includes("all"))
            return true;
          return filterValue.includes(row.original.status);
        }
        return row.original.status === filterValue;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Submitted" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        const isValid = !Number.isNaN(date.getTime());
        if (!isValid)
          return <span className="text-xs text-muted-foreground">—</span>;

        return (
          <span className="text-xs text-muted-foreground">
            {date.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const req = row.original;
        const isPending = req.status === "Pending";

        return (
          <div className="flex items-center justify-end gap-1">
            {/* Quick approve */}
            {isPending && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/20"
                      onClick={() => onApprove(req)}
                      aria-label="Approve request"
                    >
                      <Check className="size-3" />
                    </Button>
                  }
                />
                <TooltipContent side="top">Approve request</TooltipContent>
              </Tooltip>
            )}

            {/* Quick reject */}
            {isPending && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon-xs"
                      className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50/20"
                      onClick={() => onReject(req)}
                      aria-label="Reject request"
                    >
                      <X className="size-3" />
                    </Button>
                  }
                />
                <TooltipContent side="top">Reject request</TooltipContent>
              </Tooltip>
            )}

            {/* View Details */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-xs"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => onViewDetails(req)}
                    aria-label="View details"
                  >
                    <Eye className="size-3" />
                  </Button>
                }
              />
              <TooltipContent side="top">
                View full details & diff
              </TooltipContent>
            </Tooltip>

            {/* Delete request */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-xs"
                    className="h-7 w-7 text-rose-500/70 hover:text-rose-600 hover:bg-rose-50/10"
                    onClick={() => onDelete(req)}
                    aria-label="Delete request"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                }
              />
              <TooltipContent side="top">Delete request record</TooltipContent>
            </Tooltip>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
