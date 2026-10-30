import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import {
  EventTimingBadge,
  formatEventDates,
} from "@/components/admin/events/event-columns";
import {
  DataTableEntityCell,
  DataTableSortableHeader,
  getActionsColumn,
  getExpandColumn,
  multiValueFilter,
} from "@/components/data-table/data-table-column-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type AdminEvent, getEventTiming } from "@/hooks/use-admin-events";
import type { AdminRequest } from "@/hooks/use-admin-requests";
import { getInitials } from "@/lib/utils";

export const associationEventColumnLabels: Record<string, string> = {
  name: "Name",
  dates: "Dates",
  timing: "Status",
  year: "Year",
  faculty: "Faculty",
  courses: "Courses",
};

const pendingLabels: Partial<Record<AdminRequest["action"], string>> = {
  "Update Existing": "Changes pending",
  "Delete Existing": "Deletion pending",
};

export function PendingRequestBadge({ request }: { request: AdminRequest }) {
  return (
    <Badge
      variant="secondary"
      className="bg-amber-500/10 text-amber-600 dark:text-amber-400"
    >
      {pendingLabels[request.action] ?? "Request pending"}
    </Badge>
  );
}

export interface EventRequestActionsProps {
  event: AdminEvent;
  onRequestChanges: (event: AdminEvent) => void;
  onRequestDeletion: (event: AdminEvent) => void;
}

export function EventRequestActions({
  event,
  onRequestChanges,
  onRequestDeletion,
}: EventRequestActionsProps) {
  return (
    <>
      <Button
        variant="outline"
        size="icon-xs"
        className="h-7 w-7"
        onClick={() => onRequestChanges(event)}
        aria-label="Request changes"
        title="Request changes"
      >
        <Edit2 className="size-3" />
      </Button>
      <Button
        variant="outline"
        size="icon-xs"
        className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50/10"
        onClick={() => onRequestDeletion(event)}
        aria-label="Request deletion"
        title="Request deletion"
      >
        <Trash2 className="size-3" />
      </Button>
    </>
  );
}

export interface GetAssociationEventColumnsProps {
  pendingByEventId: Map<string, AdminRequest>;
  onRequestChanges: (event: AdminEvent) => void;
  onRequestDeletion: (event: AdminEvent) => void;
}

export function getAssociationEventColumns({
  pendingByEventId,
  onRequestChanges,
  onRequestDeletion,
}: GetAssociationEventColumnsProps): ColumnDef<AdminEvent>[] {
  return [
    getExpandColumn<AdminEvent>(),
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const pending = pendingByEventId.get(row.original.id);
        return (
          <DataTableEntityCell
            name={row.original.name}
            initials={getInitials(row.original.name, "E")}
            badge={pending && <PendingRequestBadge request={pending} />}
          />
        );
      },
    },
    {
      id: "dates",
      accessorFn: (row) => row.startDate ?? "",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Dates" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatEventDates(row.original)}
        </span>
      ),
      enableGlobalFilter: false,
    },
    {
      id: "timing",
      accessorFn: (row) => getEventTiming(row),
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <EventTimingBadge timing={getEventTiming(row.original)} />
      ),
      filterFn: multiValueFilter<AdminEvent>(),
      enableGlobalFilter: false,
    },
    {
      accessorKey: "year",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Year" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {row.original.year}
        </span>
      ),
      enableGlobalFilter: false,
    },
    {
      id: "faculty",
      accessorFn: (row) => row.faculty?.id ?? "",
      header: "Faculty",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground">
          {row.original.faculty?.acronym || row.original.faculty?.name || "—"}
        </span>
      ),
      enableSorting: false,
      enableGlobalFilter: false,
    },
    {
      id: "courses",
      accessorFn: (row) =>
        row.courses.map((course) => course.acronym || course.name).join(", "),
      header: "Courses",
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {(getValue() as string) || "—"}
        </span>
      ),
      enableSorting: false,
    },
    getActionsColumn<AdminEvent>({
      extraActions: (event) =>
        pendingByEventId.has(event.id) ? null : (
          <EventRequestActions
            event={event}
            onRequestChanges={onRequestChanges}
            onRequestDeletion={onRequestDeletion}
          />
        ),
    }),
  ];
}
