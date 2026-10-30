import {
  type ColumnFiltersState,
  type ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { Clock, Plus } from "lucide-react";
import * as React from "react";
import { EventDetails } from "@/components/admin/events/event-details";
import { EventFormDialog } from "@/components/admin/events/event-form-dialog";
import {
  associationEventColumnLabels,
  getAssociationEventColumns,
} from "@/components/association/events/association-event-columns";
import { AssociationEventGridCard } from "@/components/association/events/association-event-grid-card";
import { AssociationNotFound } from "@/components/association/not-found";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { SearchInput } from "@/components/common/search-input";
import { DataTableColumnToggle } from "@/components/data-table/data-table-column-toggle";
import {
  DataTableFilter,
  type DataTableFilterOption,
} from "@/components/data-table/data-table-filter";
import { DataTableView } from "@/components/data-table/data-table-view";
import { GridView } from "@/components/data-table/grid-view";
import {
  type ViewMode,
  ViewModeToggle,
} from "@/components/data-table/view-mode-toggle";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useActiveAssociation } from "@/hooks/use-active-association";
import {
  type AdminEvent,
  EVENT_TIMINGS,
  type EventFormData,
} from "@/hooks/use-admin-events";
import { useAssociationEvents } from "@/hooks/use-association-events";
import { useFacultyCourseOptions } from "@/hooks/use-faculty-course-options";
import { getErrorMessage } from "@/lib/api-client";

const timingFilterOptions: DataTableFilterOption[] = EVENT_TIMINGS.map(
  (timing) => ({ value: timing, label: timing }),
);

type FormMode = "create" | "update";

function AssociationEvents({ associationId }: { associationId: string }) {
  const {
    events,
    isLoading,
    isError,
    error,
    pendingByEventId,
    pendingCreateCount,
    createRequestMutation,
  } = useAssociationEvents(associationId);
  const { faculties, courses } = useFacultyCourseOptions();

  const [timingFilter, setTimingFilter] = React.useState<string[]>([]);
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "dates", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ year: false });
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [formMode, setFormMode] = React.useState<FormMode | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<AdminEvent | null>(
    null,
  );

  const handleOpenCreate = () => {
    setSelectedEvent(null);
    setFormMode("create");
  };

  const handleRequestChanges = React.useCallback((event: AdminEvent) => {
    setSelectedEvent(event);
    setFormMode("update");
  }, []);

  const handleRequestDeletion = React.useCallback((event: AdminEvent) => {
    setSelectedEvent(event);
    setIsDeleteOpen(true);
  }, []);

  const columns = React.useMemo(
    () =>
      getAssociationEventColumns({
        pendingByEventId,
        onRequestChanges: handleRequestChanges,
        onRequestDeletion: handleRequestDeletion,
      }),
    [pendingByEventId, handleRequestChanges, handleRequestDeletion],
  );

  const table = useReactTable({
    data: events,
    columns,
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getRowId: (row) => row.id,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 12,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      expanded,
    },
  });

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    table.setPageIndex(0);
  };

  const handleTimingFilterChange = (values: string[]) => {
    setTimingFilter(values);
    table.getColumn("timing")?.setFilterValue(values);
    table.setPageIndex(0);
  };

  const closeForm = () => {
    setFormMode(null);
    setSelectedEvent(null);
  };

  const handleFormSubmit = (formData: EventFormData) => {
    const input =
      formMode === "update" && selectedEvent
        ? {
            action: "Update Existing" as const,
            targetId: selectedEvent.id,
            payload: formData,
          }
        : { action: "Create" as const, payload: formData };

    createRequestMutation.mutate(input, { onSuccess: closeForm });
  };

  const handleDeleteConfirm = () => {
    if (!selectedEvent) return;
    createRequestMutation.mutate(
      { action: "Delete Existing", targetId: selectedEvent.id },
      {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedEvent(null);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Events"
        viewModeToggle={
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        }
        search={
          <SearchInput
            placeholder="Search Events"
            value={globalFilter}
            onChange={handleSearchChange}
          />
        }
        actions={
          <>
            {viewMode === "list" && (
              <DataTableColumnToggle
                table={table}
                columnLabels={associationEventColumnLabels}
              />
            )}
            <Button
              size="sm"
              className="h-8 gap-1.5"
              onClick={handleOpenCreate}
            >
              <Plus className="size-3.5" />
              Request new event
            </Button>
          </>
        }
        filters={
          <DataTableFilter
            title="Status"
            pluralTitle="Statuses"
            options={timingFilterOptions}
            selectedValues={timingFilter}
            onSelectedValuesChange={handleTimingFilterChange}
          />
        }
      >
        {pendingCreateCount > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {pendingCreateCount === 1
              ? "1 new event is waiting for approval."
              : `${pendingCreateCount} new events are waiting for approval.`}
          </p>
        )}
      </PageHeader>

      <DataTableView
        table={table}
        viewMode={viewMode}
        isLoading={isLoading}
        loadingMessage="Loading events..."
        isError={isError}
        errorTitle="Failed to load events"
        errorMessage={getErrorMessage(error)}
        emptyTitle="No events found"
        emptyDescription="Approved events of your association will show up here."
        renderSubComponent={(row) => <EventDetails event={row.original} />}
        renderGrid={(t) => (
          <GridView
            table={t}
            renderCard={(event, { row }) => (
              <AssociationEventGridCard
                event={event}
                pendingRequest={pendingByEventId.get(event.id)}
                isExpanded={row.getIsExpanded()}
                onExpandedChange={row.toggleExpanded}
                onRequestChanges={handleRequestChanges}
                onRequestDeletion={handleRequestDeletion}
              />
            )}
          />
        )}
      />

      <EventFormDialog
        open={formMode !== null}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
        event={selectedEvent}
        faculties={faculties}
        courses={courses}
        isLoading={createRequestMutation.isPending}
        onSubmit={handleFormSubmit}
        title={formMode === "update" ? "Request Changes" : "Request New Event"}
        description="An administrator will review your request before it takes effect."
        submitLabel="Send Request"
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Request Deletion"
        description={
          <>
            Ask an administrator to delete{" "}
            <span className="font-medium text-foreground">
              {selectedEvent?.name}
            </span>
            . The event stays visible until the request is approved.
          </>
        }
        confirmLabel="Send Request"
        loadingLabel="Sending..."
        variant="destructive"
        isLoading={createRequestMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export function AssociationEventsPage() {
  const association = useActiveAssociation();

  if (!association) {
    return <AssociationNotFound />;
  }

  return <AssociationEvents associationId={association.id} />;
}

export default AssociationEventsPage;
