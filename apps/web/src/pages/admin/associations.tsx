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
  associationColumnLabels,
  getAssociationColumns,
} from "@/components/admin/associations/association-columns";
import { AssociationFormDialog } from "@/components/admin/associations/association-form-dialog";
import { AssociationGridCard } from "@/components/admin/associations/association-grid-card";
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
  type AssociationFormData,
  useAdminAssociations,
} from "@/hooks/use-admin-associations";
import type { Association } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api-client";
import { downloadCsv } from "@/lib/csv-export";

function exportAssociationsToCsv(
  associationsList: Association[],
  filename: string,
) {
  const headers = ["ID", "Name", "Acronym", "Members"];
  const rows = associationsList.map((a) => [
    a.id,
    a.name,
    a.acronym || "",
    a.users?.length ?? 0,
  ]);
  downloadCsv(filename, headers, rows);
}

export function AdminAssociationsPage() {
  const {
    associations,
    isLoading,
    isError,
    error,
    createAssociationMutation,
    updateAssociationMutation,
    deleteAssociationMutation,
    bulkDeleteAssociationsMutation,
  } = useAdminAssociations();

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
  const [selectedAssociation, setSelectedAssociation] =
    React.useState<Association | null>(null);

  const handleOpenCreate = React.useCallback(() => {
    setIsCreateOpen(true);
  }, []);

  const handleOpenEdit = React.useCallback((association: Association) => {
    setSelectedAssociation(association);
    setIsEditOpen(true);
  }, []);

  const handleOpenDelete = React.useCallback((association: Association) => {
    setSelectedAssociation(association);
    setIsDeleteOpen(true);
  }, []);

  const columns = React.useMemo(
    () =>
      getAssociationColumns({
        onEdit: handleOpenEdit,
        onDelete: handleOpenDelete,
      }),
    [handleOpenEdit, handleOpenDelete],
  );

  const table = useReactTable({
    data: associations,
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

  const handleCreateSubmit = (formData: AssociationFormData) => {
    createAssociationMutation.mutate(formData, {
      onSuccess: () => {
        setIsCreateOpen(false);
      },
    });
  };

  const handleEditSubmit = (formData: AssociationFormData) => {
    if (!selectedAssociation) return;

    updateAssociationMutation.mutate(
      { id: selectedAssociation.id, payload: formData },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setSelectedAssociation(null);
        },
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!selectedAssociation) return;
    deleteAssociationMutation.mutate(selectedAssociation.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedAssociation(null);
      },
    });
  };

  const selectedRows = table
    .getFilteredRowModel()
    .rows.filter((row) => row.getIsSelected());
  const selectedAssociations = selectedRows.map((row) => row.original);
  const selectedCount = selectedAssociations.length;

  const handleBulkDeleteConfirm = () => {
    const ids = selectedAssociations.map((a) => a.id);
    if (ids.length === 0) return;

    bulkDeleteAssociationsMutation.mutate(ids, {
      onSuccess: () => {
        setIsBulkDeleteOpen(false);
        table.resetRowSelection();
      },
    });
  };

  const handleExportSelected = () => {
    if (selectedAssociations.length === 0) return;
    exportAssociationsToCsv(
      selectedAssociations,
      `associations_selected_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const handleClearSelection = () => {
    table.resetRowSelection();
  };

  const handleDownloadCSV = () => {
    const filteredAssociations = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    exportAssociationsToCsv(
      filteredAssociations,
      `associations_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Associations"
        viewModeToggle={
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        }
        search={
          <SearchInput
            placeholder="Search Associations"
            value={globalFilter}
            onChange={handleSearchChange}
          />
        }
        actions={
          <>
            {viewMode === "list" && (
              <DataTableColumnToggle
                table={table}
                columnLabels={associationColumnLabels}
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
              New Association
            </Button>
          </>
        }
      />

      <DataTableView
        table={table}
        viewMode={viewMode}
        isLoading={isLoading}
        loadingMessage="Loading associations database..."
        isError={isError}
        errorTitle="Failed to load associations"
        errorMessage={getErrorMessage(error)}
        emptyTitle="No associations found"
        emptyDescription="Try resetting your search query."
        renderGrid={(t) => (
          <GridView
            table={t}
            renderCard={(association, { isSelected, onSelectChange }) => (
              <AssociationGridCard
                association={association}
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
        entityLabel="association"
        entityPluralLabel="associations"
        onExport={handleExportSelected}
        onDelete={() => setIsBulkDeleteOpen(true)}
        onClear={handleClearSelection}
      />

      <AssociationFormDialog
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        isLoading={createAssociationMutation.isPending}
        onSubmit={handleCreateSubmit}
      />

      <AssociationFormDialog
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        association={selectedAssociation}
        isLoading={updateAssociationMutation.isPending}
        onSubmit={handleEditSubmit}
      />

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        entityName="Association"
        itemName={selectedAssociation?.name}
        itemDetails={
          selectedAssociation?.acronym
            ? ` (${selectedAssociation.acronym})`
            : undefined
        }
        isLoading={deleteAssociationMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      <BulkDeleteDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        selectedCount={selectedCount}
        entityLabel="association"
        entityPluralLabel="associations"
        isLoading={bulkDeleteAssociationsMutation.isPending}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  );
}

export default AdminAssociationsPage;
