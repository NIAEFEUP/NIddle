import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { Download, Plus } from "lucide-react";
import * as React from "react";
import {
  facultyColumnLabels,
  getFacultyColumns,
} from "@/components/admin/faculties/faculty-columns";
import { FacultyFormDialog } from "@/components/admin/faculties/faculty-form-dialog";
import { FacultyGridCard } from "@/components/admin/faculties/faculty-grid-card";
import {
  BulkDeleteDialog,
  DeleteDialog,
} from "@/components/common/delete-dialog";
import { SearchInput } from "@/components/common/search-input";
import { BulkActions } from "@/components/data-table/bulk-actions";
import { DataTableColumnToggle } from "@/components/data-table/data-table-column-toggle";
import { DataTableView } from "@/components/data-table/data-table-view";
import { GridView } from "@/components/data-table/grid-view";
import {
  type ViewMode,
  ViewModeToggle,
} from "@/components/data-table/view-mode-toggle";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Faculty,
  type FacultyFormData,
  useAdminFaculties,
} from "@/hooks/use-admin-faculties";
import { getErrorMessage } from "@/lib/api-client";
import { downloadCsv } from "@/lib/csv-export";

function exportFacultiesToCsv(facultiesList: Faculty[], filename: string) {
  const headers = ["ID", "Name", "Acronym", "Courses"];
  const rows = facultiesList.map((f) => {
    const coursesStr = (f.courses || [])
      .map((c) => c.acronym || c.name)
      .join("; ");
    return [f.id, f.name, f.acronym || "", coursesStr];
  });
  downloadCsv(filename, headers, rows);
}

export function AdminFacultiesPage() {
  const {
    faculties,
    courses,
    isLoading,
    isError,
    error,
    createFacultyMutation,
    updateFacultyMutation,
    deleteFacultyMutation,
    bulkDeleteFacultiesMutation,
  } = useAdminFaculties();

  const [courseFilter, setCourseFilter] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false);
  const [selectedFaculty, setSelectedFaculty] = React.useState<Faculty | null>(
    null,
  );

  const handleOpenCreate = React.useCallback(() => {
    setIsCreateOpen(true);
  }, []);

  const handleOpenEdit = React.useCallback((faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsEditOpen(true);
  }, []);

  const handleOpenDelete = React.useCallback((faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsDeleteOpen(true);
  }, []);

  const columns = React.useMemo(
    () =>
      getFacultyColumns({
        onEdit: handleOpenEdit,
        onDelete: handleOpenDelete,
      }),
    [handleOpenEdit, handleOpenDelete],
  );

  const table = useReactTable({
    data: faculties,
    columns,
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      sorting: [{ id: "name", desc: false }],
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
    },
  });

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    table.setPageIndex(0);
  };

  const handleCourseFilterChange = (value: string | null) => {
    const val = value ?? "all";
    setCourseFilter(val);
    table.getColumn("courses")?.setFilterValue(val);
    table.setPageIndex(0);
  };

  const handleCreateSubmit = (formData: FacultyFormData) => {
    createFacultyMutation.mutate(formData, {
      onSuccess: () => {
        setIsCreateOpen(false);
      },
    });
  };

  const handleEditSubmit = (formData: FacultyFormData) => {
    if (!selectedFaculty) return;

    updateFacultyMutation.mutate(
      { id: selectedFaculty.id, payload: formData },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setSelectedFaculty(null);
        },
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!selectedFaculty) return;
    deleteFacultyMutation.mutate(selectedFaculty.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedFaculty(null);
      },
    });
  };

  const selectedRows = table
    .getFilteredRowModel()
    .rows.filter((row) => row.getIsSelected());
  const selectedFaculties = selectedRows.map((row) => row.original);
  const selectedCount = selectedFaculties.length;

  const handleBulkDeleteConfirm = () => {
    const ids = selectedFaculties.map((f) => f.id);
    if (ids.length === 0) return;

    bulkDeleteFacultiesMutation.mutate(ids, {
      onSuccess: () => {
        setIsBulkDeleteOpen(false);
        table.resetRowSelection();
      },
    });
  };

  const handleExportSelected = () => {
    if (selectedFaculties.length === 0) return;
    exportFacultiesToCsv(
      selectedFaculties,
      `faculties_selected_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const handleClearSelection = () => {
    table.resetRowSelection();
  };

  const handleDownloadCSV = () => {
    const filteredFaculties = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    exportFacultiesToCsv(
      filteredFaculties,
      `faculties_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Faculties"
        viewModeToggle={
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        }
        search={
          <SearchInput
            placeholder="Search Faculties"
            value={globalFilter}
            onChange={handleSearchChange}
          />
        }
        actions={
          <>
            {viewMode === "list" && (
              <DataTableColumnToggle
                table={table}
                columnLabels={facultyColumnLabels}
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
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
              onClick={handleOpenCreate}
            >
              <Plus className="size-3.5" />
              New Faculty
            </Button>
          </>
        }
        filters={
          <Select value={courseFilter} onValueChange={handleCourseFilterChange}>
            <SelectTrigger className="h-8 w-fit gap-1 text-xs">
              <span className="text-muted-foreground">Filter by Course</span>
              <SelectValue>
                {(val) => {
                  if (!val || val === "all") return "All Courses";
                  const found = courses.find(
                    (c) => String(c.id) === String(val),
                  );
                  return found?.acronym || found?.name || val;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={String(course.id)}>
                  {course.acronym || course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <DataTableView
        table={table}
        viewMode={viewMode}
        isLoading={isLoading}
        loadingMessage="Loading faculties database..."
        isError={isError}
        errorTitle="Failed to load faculties"
        errorMessage={getErrorMessage(error)}
        emptyTitle="No faculties found"
        emptyDescription="Try resetting your filters or search query."
        renderGrid={(t) => (
          <GridView
            table={t}
            renderCard={(faculty, { isSelected, onSelectChange }) => (
              <FacultyGridCard
                faculty={faculty}
                isSelected={isSelected}
                onSelectChange={onSelectChange}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            )}
          />
        )}
      />

      <BulkActions
        selectedCount={selectedCount}
        entityLabel="faculty"
        entityPluralLabel="faculties"
        onExport={handleExportSelected}
        onDelete={() => setIsBulkDeleteOpen(true)}
        onClear={handleClearSelection}
      />

      <FacultyFormDialog
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        courses={courses}
        isLoading={createFacultyMutation.isPending}
        onSubmit={handleCreateSubmit}
      />

      <FacultyFormDialog
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        faculty={selectedFaculty}
        courses={courses}
        isLoading={updateFacultyMutation.isPending}
        onSubmit={handleEditSubmit}
      />

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        entityName="Faculty"
        itemName={selectedFaculty?.name}
        itemDetails={
          selectedFaculty?.acronym ? ` (${selectedFaculty.acronym})` : undefined
        }
        isLoading={deleteFacultyMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      <BulkDeleteDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        selectedCount={selectedCount}
        entityLabel="faculty"
        entityPluralLabel="faculties"
        isLoading={bulkDeleteFacultiesMutation.isPending}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  );
}

export default AdminFacultiesPage;
