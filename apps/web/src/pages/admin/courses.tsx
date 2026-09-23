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
  courseColumnLabels,
  getCourseColumns,
} from "@/components/admin/courses/course-columns";
import { CourseFormDialog } from "@/components/admin/courses/course-form-dialog";
import { CourseGridCard } from "@/components/admin/courses/course-grid-card";
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
  type Course,
  type CourseFormData,
  useAdminCourses,
} from "@/hooks/use-admin-courses";
import { getErrorMessage } from "@/lib/api-client";
import { downloadCsv } from "@/lib/csv-export";
import { getInitials } from "@/lib/utils";

function exportCoursesToCsv(coursesList: Course[], filename: string) {
  const headers = ["ID", "Name", "Acronym", "Faculties"];
  const rows = coursesList.map((c) => {
    const facultiesStr = (c.faculties || [])
      .map((f) => f.acronym || f.name)
      .join("; ");
    return [c.id, c.name, c.acronym || "", facultiesStr];
  });
  downloadCsv(filename, headers, rows);
}

export function AdminCoursesPage() {
  const {
    courses,
    faculties,
    isLoading,
    isError,
    error,
    createCourseMutation,
    updateCourseMutation,
    deleteCourseMutation,
    bulkDeleteCoursesMutation,
  } = useAdminCourses();

  const [facultyFilter, setFacultyFilter] = React.useState<string[]>([]);
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  const facultyOptions: DataTableFilterOption[] = React.useMemo(
    () =>
      faculties.map((faculty) => ({
        value: String(faculty.id),
        label: faculty.acronym || faculty.name,
        description:
          faculty.acronym && faculty.name && faculty.acronym !== faculty.name
            ? faculty.name
            : undefined,
        initials: getInitials(faculty.acronym || faculty.name, "F"),
      })),
    [faculties],
  );

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
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(
    null,
  );

  const handleOpenCreate = React.useCallback(() => {
    setIsCreateOpen(true);
  }, []);

  const handleOpenEdit = React.useCallback((course: Course) => {
    setSelectedCourse(course);
    setIsEditOpen(true);
  }, []);

  const handleOpenDelete = React.useCallback((course: Course) => {
    setSelectedCourse(course);
    setIsDeleteOpen(true);
  }, []);

  const columns = React.useMemo(
    () =>
      getCourseColumns({
        onEdit: handleOpenEdit,
        onDelete: handleOpenDelete,
      }),
    [handleOpenEdit, handleOpenDelete],
  );

  const table = useReactTable({
    data: courses,
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

  const handleFacultyFilterChange = (values: string[]) => {
    setFacultyFilter(values);
    table.getColumn("faculties")?.setFilterValue(values);
    table.setPageIndex(0);
  };

  const handleCreateSubmit = (formData: CourseFormData) => {
    createCourseMutation.mutate(formData, {
      onSuccess: () => {
        setIsCreateOpen(false);
      },
    });
  };

  const handleEditSubmit = (formData: CourseFormData) => {
    if (!selectedCourse) return;

    updateCourseMutation.mutate(
      { id: selectedCourse.id, payload: formData },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setSelectedCourse(null);
        },
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!selectedCourse) return;
    deleteCourseMutation.mutate(selectedCourse.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedCourse(null);
      },
    });
  };

  const selectedRows = table
    .getFilteredRowModel()
    .rows.filter((row) => row.getIsSelected());
  const selectedCourses = selectedRows.map((row) => row.original);
  const selectedCount = selectedCourses.length;

  const handleBulkDeleteConfirm = () => {
    const ids = selectedCourses.map((c) => c.id);
    if (ids.length === 0) return;

    bulkDeleteCoursesMutation.mutate(ids, {
      onSuccess: () => {
        setIsBulkDeleteOpen(false);
        table.resetRowSelection();
      },
    });
  };

  const handleExportSelected = () => {
    if (selectedCourses.length === 0) return;
    exportCoursesToCsv(
      selectedCourses,
      `courses_selected_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const handleClearSelection = () => {
    table.resetRowSelection();
  };

  const handleDownloadCSV = () => {
    const filteredCourses = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    exportCoursesToCsv(
      filteredCourses,
      `courses_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Courses"
        viewModeToggle={
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        }
        search={
          <SearchInput
            placeholder="Search Courses"
            value={globalFilter}
            onChange={handleSearchChange}
          />
        }
        actions={
          <>
            {viewMode === "list" && (
              <DataTableColumnToggle
                table={table}
                columnLabels={courseColumnLabels}
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
              New Course
            </Button>
          </>
        }
        filters={
          <DataTableFilter
            title="Faculty"
            pluralTitle="Faculties"
            options={facultyOptions}
            selectedValues={facultyFilter}
            onSelectedValuesChange={handleFacultyFilterChange}
          />
        }
      />

      <DataTableView
        table={table}
        viewMode={viewMode}
        isLoading={isLoading}
        loadingMessage="Loading courses database..."
        isError={isError}
        errorTitle="Failed to load courses"
        errorMessage={getErrorMessage(error)}
        emptyTitle="No courses found"
        emptyDescription="Try resetting your filters or search query."
        renderGrid={(t) => (
          <GridView
            table={t}
            renderCard={(course, { isSelected, onSelectChange }) => (
              <CourseGridCard
                course={course}
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
        entityLabel="course"
        entityPluralLabel="courses"
        onExport={handleExportSelected}
        onDelete={() => setIsBulkDeleteOpen(true)}
        onClear={handleClearSelection}
      />

      <CourseFormDialog
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        faculties={faculties}
        isLoading={createCourseMutation.isPending}
        onSubmit={handleCreateSubmit}
      />

      <CourseFormDialog
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        course={selectedCourse}
        faculties={faculties}
        isLoading={updateCourseMutation.isPending}
        onSubmit={handleEditSubmit}
      />

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        entityName="Course"
        itemName={selectedCourse?.name}
        itemDetails={
          selectedCourse?.acronym ? ` (${selectedCourse.acronym})` : undefined
        }
        isLoading={deleteCourseMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      <BulkDeleteDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        selectedCount={selectedCount}
        entityLabel="course"
        entityPluralLabel="courses"
        isLoading={bulkDeleteCoursesMutation.isPending}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  );
}

export default AdminCoursesPage;
