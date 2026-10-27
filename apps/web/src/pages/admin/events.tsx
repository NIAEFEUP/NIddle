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
import { Download } from "lucide-react";
import * as React from "react";
import {
  eventColumnLabels,
  getEventAssociationLabel,
  getEventColumns,
} from "@/components/admin/events/event-columns";
import { EventDetails } from "@/components/admin/events/event-details";
import { EventFormDialog } from "@/components/admin/events/event-form-dialog";
import { EventGridCard } from "@/components/admin/events/event-grid-card";
import {
  BulkDeleteDialog,
  DeleteDialog,
} from "@/components/common/delete-dialog";
import { SearchInput } from "@/components/common/search-input";
import { BulkActions } from "@/components/data-table/bulk-actions";
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
import {
  type AdminEvent,
  EVENT_TIMINGS,
  type EventFormData,
  getEventTiming,
  useAdminEvents,
} from "@/hooks/use-admin-events";
import { useFacultyCourseOptions } from "@/hooks/use-faculty-course-options";
import { getErrorMessage } from "@/lib/api-client";
import { downloadCsv } from "@/lib/csv-export";
import { getInitials } from "@/lib/utils";

const timingFilterOptions: DataTableFilterOption[] = EVENT_TIMINGS.map(
  (timing) => ({ value: timing, label: timing }),
);

function exportEventsToCsv(eventsList: AdminEvent[], filename: string) {
  const headers = [
    "ID",
    "Name",
    "Description",
    "Year",
    "Start",
    "End",
    "Status",
    "Association",
    "Faculty",
    "Courses",
  ];
  const rows = eventsList.map((e) => [
    e.id,
    e.name,
    e.description ?? "",
    e.year,
    e.startDate ?? "",
    e.endDate ?? "",
    getEventTiming(e),
    getEventAssociationLabel(e),
    e.faculty?.acronym || e.faculty?.name || "",
    e.courses.map((c) => c.acronym || c.name).join("; "),
  ]);
  downloadCsv(filename, headers, rows);
}

export function AdminEventsPage() {
  const {
    events,
    isLoading,
    isError,
    error,
    updateEventMutation,
    deleteEventMutation,
    bulkDeleteEventsMutation,
  } = useAdminEvents();
  const { faculties, courses } = useFacultyCourseOptions();

  const [timingFilter, setTimingFilter] = React.useState<string[]>([]);
  const [associationFilter, setAssociationFilter] = React.useState<string[]>(
    [],
  );
  const [facultyFilter, setFacultyFilter] = React.useState<string[]>([]);
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  const associationOptions: DataTableFilterOption[] = React.useMemo(() => {
    const byId = new Map<string, DataTableFilterOption>();
    for (const event of events) {
      if (!event.createdBy || byId.has(event.createdBy.id)) continue;
      const label = getEventAssociationLabel(event);
      byId.set(event.createdBy.id, {
        value: event.createdBy.id,
        label,
        description:
          event.createdBy.name !== label ? event.createdBy.name : undefined,
        initials: getInitials(label, "A"),
      });
    }
    return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [events]);

  const facultyOptions: DataTableFilterOption[] = React.useMemo(
    () =>
      faculties.map((faculty) => ({
        value: String(faculty.id),
        label: faculty.acronym || faculty.name,
        description:
          faculty.acronym && faculty.name !== faculty.acronym
            ? faculty.name
            : undefined,
        initials: getInitials(faculty.acronym || faculty.name, "F"),
      })),
    [faculties],
  );

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "dates", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ year: false });
  const [rowSelection, setRowSelection] = React.useState({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<AdminEvent | null>(
    null,
  );

  const handleOpenEdit = React.useCallback((event: AdminEvent) => {
    setSelectedEvent(event);
    setIsEditOpen(true);
  }, []);

  const handleOpenDelete = React.useCallback((event: AdminEvent) => {
    setSelectedEvent(event);
    setIsDeleteOpen(true);
  }, []);

  const columns = React.useMemo(
    () =>
      getEventColumns({
        onEdit: handleOpenEdit,
        onDelete: handleOpenDelete,
      }),
    [handleOpenEdit, handleOpenDelete],
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
    onRowSelectionChange: setRowSelection,
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
      rowSelection,
      globalFilter,
      expanded,
    },
  });

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    table.setPageIndex(0);
  };

  const handleColumnFilterChange =
    (columnId: string, setValues: (values: string[]) => void) =>
    (values: string[]) => {
      setValues(values);
      table.getColumn(columnId)?.setFilterValue(values);
      table.setPageIndex(0);
    };

  const handleEditSubmit = (formData: EventFormData) => {
    if (!selectedEvent) return;
    updateEventMutation.mutate(
      { id: selectedEvent.id, payload: formData },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setSelectedEvent(null);
        },
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!selectedEvent) return;
    deleteEventMutation.mutate(selectedEvent.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedEvent(null);
      },
    });
  };

  const selectedRows = table
    .getFilteredRowModel()
    .rows.filter((row) => row.getIsSelected());
  const selectedEvents = selectedRows.map((row) => row.original);
  const selectedCount = selectedEvents.length;

  const handleBulkDeleteConfirm = () => {
    const ids = selectedEvents.map((e) => e.id);
    if (ids.length === 0) return;

    bulkDeleteEventsMutation.mutate(ids, {
      onSuccess: () => {
        setIsBulkDeleteOpen(false);
        table.resetRowSelection();
      },
    });
  };

  const handleExportSelected = () => {
    if (selectedEvents.length === 0) return;
    exportEventsToCsv(
      selectedEvents,
      `events_selected_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const handleClearSelection = () => {
    table.resetRowSelection();
  };

  const handleDownloadCSV = () => {
    const filteredEvents = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    exportEventsToCsv(
      filteredEvents,
      `events_export_${new Date().toISOString().slice(0, 10)}.csv`,
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
                columnLabels={eventColumnLabels}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-normal border-input"
              onClick={handleDownloadCSV}
            >
              <Download className="size-3.5" />
              Download CSV
            </Button>
          </>
        }
        filters={
          <>
            <DataTableFilter
              title="Status"
              pluralTitle="Statuses"
              options={timingFilterOptions}
              selectedValues={timingFilter}
              onSelectedValuesChange={handleColumnFilterChange(
                "timing",
                setTimingFilter,
              )}
            />
            <DataTableFilter
              title="Association"
              pluralTitle="Associations"
              options={associationOptions}
              selectedValues={associationFilter}
              onSelectedValuesChange={handleColumnFilterChange(
                "association",
                setAssociationFilter,
              )}
            />
            <DataTableFilter
              title="Faculty"
              pluralTitle="Faculties"
              options={facultyOptions}
              selectedValues={facultyFilter}
              onSelectedValuesChange={handleColumnFilterChange(
                "faculty",
                setFacultyFilter,
              )}
            />
          </>
        }
      />

      <DataTableView
        table={table}
        viewMode={viewMode}
        isLoading={isLoading}
        loadingMessage="Loading events..."
        isError={isError}
        errorTitle="Failed to load events"
        errorMessage={getErrorMessage(error)}
        emptyTitle="No events found"
        emptyDescription="Try resetting your filters or search query."
        renderSubComponent={(row) => <EventDetails event={row.original} />}
        renderGrid={(t) => (
          <GridView
            table={t}
            renderCard={(event, { isSelected, onSelectChange, row }) => (
              <EventGridCard
                event={event}
                isSelected={isSelected}
                onSelectChange={onSelectChange}
                isExpanded={row.getIsExpanded()}
                onExpandedChange={row.toggleExpanded}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            )}
          />
        )}
      />

      <BulkActions
        selectedCount={selectedCount}
        entityLabel="event"
        entityPluralLabel="events"
        onExport={handleExportSelected}
        onDelete={() => setIsBulkDeleteOpen(true)}
        onClear={handleClearSelection}
      />

      <EventFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        event={selectedEvent}
        faculties={faculties}
        courses={courses}
        isLoading={updateEventMutation.isPending}
        onSubmit={handleEditSubmit}
      />

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        entityName="Event"
        itemName={selectedEvent?.name}
        isLoading={deleteEventMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      <BulkDeleteDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        selectedCount={selectedCount}
        entityLabel="event"
        entityPluralLabel="events"
        isLoading={bulkDeleteEventsMutation.isPending}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  );
}

export default AdminEventsPage;
