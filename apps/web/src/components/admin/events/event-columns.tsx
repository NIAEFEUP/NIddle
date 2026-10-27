import type { ColumnDef } from "@tanstack/react-table";
import {
  DataTableEntityCell,
  DataTableSortableHeader,
  getActionsColumn,
  getExpandColumn,
  getSelectColumn,
  multiValueFilter,
} from "@/components/data-table/data-table-column-helpers";
import { Badge } from "@/components/ui/badge";
import {
  type AdminEvent,
  type EventTiming,
  getEventTiming,
} from "@/hooks/use-admin-events";
import { cn, getInitials } from "@/lib/utils";

export const eventColumnLabels: Record<string, string> = {
  name: "Name",
  association: "Association",
  dates: "Dates",
  timing: "Status",
  year: "Year",
  faculty: "Faculty",
  courses: "Courses",
};

const timingClasses: Record<EventTiming, string> = {
  Upcoming: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  Ongoing: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Past: "bg-muted text-muted-foreground",
  Undated: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function EventTimingBadge({ timing }: { timing: EventTiming }) {
  return (
    <Badge variant="secondary" className={cn(timingClasses[timing])}>
      {timing}
    </Badge>
  );
}

function formatDay(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatEventDates(event: AdminEvent): string {
  if (!event.startDate) return "—";
  const start = formatDay(event.startDate);
  if (!event.endDate) return start;
  const end = formatDay(event.endDate);
  return start === end ? start : `${start} – ${end}`;
}

export function getEventAssociationLabel(event: AdminEvent): string {
  return event.createdBy?.acronym || event.createdBy?.name || "";
}

export interface GetEventColumnsProps {
  onEdit: (event: AdminEvent) => void;
  onDelete: (event: AdminEvent) => void;
}

export function getEventColumns({
  onEdit,
  onDelete,
}: GetEventColumnsProps): ColumnDef<AdminEvent>[] {
  return [
    getSelectColumn<AdminEvent>(),
    getExpandColumn<AdminEvent>(),
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <DataTableEntityCell
          name={row.original.name}
          initials={getInitials(row.original.name, "E")}
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
          {getEventAssociationLabel(row.original) || "—"}
        </span>
      ),
      sortingFn: (a, b) =>
        getEventAssociationLabel(a.original).localeCompare(
          getEventAssociationLabel(b.original),
        ),
      filterFn: multiValueFilter<AdminEvent>(),
      enableGlobalFilter: false,
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
      filterFn: multiValueFilter<AdminEvent>(),
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
    getActionsColumn<AdminEvent>({ onEdit, onDelete }),
  ];
}
