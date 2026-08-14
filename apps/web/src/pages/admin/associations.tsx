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
import { AdminDataView } from "@/components/admin/admin-data-view";
import { AdminBulkDeleteDialog } from "@/components/admin/admin-delete-dialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearchInput } from "@/components/admin/admin-search-input";
import { AssociationBulkActions } from "@/components/admin/associations/association-bulk-actions";
import {
  associationColumnLabels,
  getAssociationColumns,
} from "@/components/admin/associations/association-columns";
import { AssociationFormDialog } from "@/components/admin/associations/association-form-dialog";
import { AssociationGridView } from "@/components/admin/associations/association-grid-view";
import { DeleteAssociationDialog } from "@/components/admin/associations/delete-association-dialog";
import {
  type ViewMode,
  ViewModeToggle,
} from "@/components/admin/view-mode-toggle";
import { DataTableColumnToggle } from "@/components/data-table/data-table-column-toggle";
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
      <AdminPageHeader
        title="Associations"
        viewModeToggle={
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        }
        search={
          <AdminSearchInput
            placeholder="Search Associations"
            value={globalFilter}
            onChange={setGlobalFilter}
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

      <AdminDataView
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
          <AssociationGridView
            table={t}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        )}
      />

      <AssociationBulkActions
        selectedCount={selectedCount}
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

      <DeleteAssociationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        association={selectedAssociation}
        isLoading={deleteAssociationMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      <AdminBulkDeleteDialog
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
