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
  getServiceAssociationLabel,
  getServiceColumns,
  getServiceScopeLabel,
  serviceColumnLabels,
} from "@/components/admin/services/service-columns";
import { ServiceDetails } from "@/components/admin/services/service-details";
import { ServiceFormDialog } from "@/components/admin/services/service-form-dialog";
import { ServiceGridCard } from "@/components/admin/services/service-grid-card";
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
  type AdminService,
  type ServiceFormData,
  sortSchedule,
  toShortTime,
  useAdminServices,
} from "@/hooks/use-admin-services";
import { useFacultyCourseOptions } from "@/hooks/use-faculty-course-options";
import { getErrorMessage } from "@/lib/api-client";
import { downloadCsv } from "@/lib/csv-export";
import { getInitials } from "@/lib/utils";

function exportServicesToCsv(servicesList: AdminService[], filename: string) {
  const headers = [
    "ID",
    "Name",
    "Association",
    "Faculty / Course",
    "Location",
    "Email",
    "Phone",
    "Schedule",
  ];
  const rows = servicesList.map((s) => [
    s.id,
    s.name,
    getServiceAssociationLabel(s),
    getServiceScopeLabel(s),
    s.location ?? "",
    s.email ?? "",
    s.phoneNumber ?? "",
    sortSchedule(s.schedule ?? [])
      .map(
        (entry) =>
          `${entry.dayOfWeek} ${toShortTime(entry.startTime)}-${toShortTime(entry.endTime)}`,
      )
      .join("; "),
  ]);
  downloadCsv(filename, headers, rows);
}

export function AdminServicesPage() {
  const {
    services,
    isLoading,
    isError,
    error,
    updateServiceMutation,
    deleteServiceMutation,
    bulkDeleteServicesMutation,
  } = useAdminServices();
  const { faculties, courses } = useFacultyCourseOptions();

  const [associationFilter, setAssociationFilter] = React.useState<string[]>(
    [],
  );
  const [scopeFilter, setScopeFilter] = React.useState<string[]>([]);
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  const associationOptions: DataTableFilterOption[] = React.useMemo(() => {
    const byId = new Map<string, DataTableFilterOption>();
    for (const service of services) {
      if (!service.createdBy || byId.has(service.createdBy.id)) continue;
      const label = getServiceAssociationLabel(service);
      byId.set(service.createdBy.id, {
        value: service.createdBy.id,
        label,
        description:
          service.createdBy.name !== label ? service.createdBy.name : undefined,
        initials: getInitials(label, "A"),
      });
    }
    return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [services]);

  const scopeOptions: DataTableFilterOption[] = React.useMemo(
    () => [
      ...faculties.map((faculty) => ({
        value: String(faculty.id),
        label: faculty.acronym || faculty.name,
        description: `Faculty · ${faculty.name}`,
        initials: getInitials(faculty.acronym || faculty.name, "F"),
      })),
      ...courses.map((course) => ({
        value: String(course.id),
        label: course.acronym || course.name,
        description: `Course · ${course.name}`,
        initials: getInitials(course.acronym || course.name, "C"),
      })),
    ],
    [faculties, courses],
  );

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ phoneNumber: false });
  const [rowSelection, setRowSelection] = React.useState({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false);
  const [selectedService, setSelectedService] =
    React.useState<AdminService | null>(null);

  const handleOpenEdit = React.useCallback((service: AdminService) => {
    setSelectedService(service);
    setIsEditOpen(true);
  }, []);

  const handleOpenDelete = React.useCallback((service: AdminService) => {
    setSelectedService(service);
    setIsDeleteOpen(true);
  }, []);

  const columns = React.useMemo(
    () =>
      getServiceColumns({
        onEdit: handleOpenEdit,
        onDelete: handleOpenDelete,
      }),
    [handleOpenEdit, handleOpenDelete],
  );

  const table = useReactTable({
    data: services,
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

  const handleEditSubmit = (formData: ServiceFormData) => {
    if (!selectedService) return;
    updateServiceMutation.mutate(
      { id: selectedService.id, payload: formData },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setSelectedService(null);
        },
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!selectedService) return;
    deleteServiceMutation.mutate(selectedService.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedService(null);
      },
    });
  };

  const selectedRows = table
    .getFilteredRowModel()
    .rows.filter((row) => row.getIsSelected());
  const selectedServices = selectedRows.map((row) => row.original);
  const selectedCount = selectedServices.length;

  const handleBulkDeleteConfirm = () => {
    const ids = selectedServices.map((s) => s.id);
    if (ids.length === 0) return;

    bulkDeleteServicesMutation.mutate(ids, {
      onSuccess: () => {
        setIsBulkDeleteOpen(false);
        table.resetRowSelection();
      },
    });
  };

  const handleExportSelected = () => {
    if (selectedServices.length === 0) return;
    exportServicesToCsv(
      selectedServices,
      `services_selected_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const handleClearSelection = () => {
    table.resetRowSelection();
  };

  const handleDownloadCSV = () => {
    const filteredServices = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    exportServicesToCsv(
      filteredServices,
      `services_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Services"
        viewModeToggle={
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        }
        search={
          <SearchInput
            placeholder="Search Services"
            value={globalFilter}
            onChange={handleSearchChange}
          />
        }
        actions={
          <>
            {viewMode === "list" && (
              <DataTableColumnToggle
                table={table}
                columnLabels={serviceColumnLabels}
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
              title="Faculty / Course"
              pluralTitle="Faculties / Courses"
              options={scopeOptions}
              selectedValues={scopeFilter}
              onSelectedValuesChange={handleColumnFilterChange(
                "scope",
                setScopeFilter,
              )}
            />
          </>
        }
      />

      <DataTableView
        table={table}
        viewMode={viewMode}
        isLoading={isLoading}
        loadingMessage="Loading services..."
        isError={isError}
        errorTitle="Failed to load services"
        errorMessage={getErrorMessage(error)}
        emptyTitle="No services found"
        emptyDescription="Try resetting your filters or search query."
        renderSubComponent={(row) => <ServiceDetails service={row.original} />}
        renderGrid={(t) => (
          <GridView
            table={t}
            renderCard={(service, { isSelected, onSelectChange, row }) => (
              <ServiceGridCard
                service={service}
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
        entityLabel="service"
        entityPluralLabel="services"
        onExport={handleExportSelected}
        onDelete={() => setIsBulkDeleteOpen(true)}
        onClear={handleClearSelection}
      />

      <ServiceFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        service={selectedService}
        faculties={faculties}
        courses={courses}
        isLoading={updateServiceMutation.isPending}
        onSubmit={handleEditSubmit}
      />

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        entityName="Service"
        itemName={selectedService?.name}
        isLoading={deleteServiceMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      <BulkDeleteDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        selectedCount={selectedCount}
        entityLabel="service"
        entityPluralLabel="services"
        isLoading={bulkDeleteServicesMutation.isPending}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  );
}

export default AdminServicesPage;
