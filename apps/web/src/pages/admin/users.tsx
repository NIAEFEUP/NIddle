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
import { Download, Plus, Search } from "lucide-react";
import * as React from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  DataEmptyState,
  DataErrorState,
  DataLoadingState,
} from "@/components/admin/data-state-view";
import { DeleteUserDialog } from "@/components/admin/users/delete-user-dialog";
import { UserBulkActions } from "@/components/admin/users/user-bulk-actions";
import {
  getUserColumns,
  userColumnLabels,
} from "@/components/admin/users/user-columns";
import { UserFormDialog } from "@/components/admin/users/user-form-dialog";
import { UserGridView } from "@/components/admin/users/user-grid-view";
import {
  type ViewMode,
  ViewModeToggle,
} from "@/components/admin/view-mode-toggle";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnToggle } from "@/components/data-table/data-table-column-toggle";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type UserFormData, useAdminUsers } from "@/hooks/use-admin-users";
import type { User } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api-client";
import { downloadCsv } from "@/lib/csv-export";

export function AdminUsersPage() {
  const {
    users,
    associations,
    isLoading,
    isError,
    error,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
    bulkDeleteUsersMutation,
  } = useAdminUsers();

  const [roleFilter, setRoleFilter] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  const [sorting, setSorting] = React.useState<SortingState>([]);
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
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const handleOpenCreate = React.useCallback(() => {
    setIsCreateOpen(true);
  }, []);

  const handleOpenEdit = React.useCallback((user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  }, []);

  const handleOpenDelete = React.useCallback((user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  }, []);

  const columns = React.useMemo(
    () =>
      getUserColumns({ onEdit: handleOpenEdit, onDelete: handleOpenDelete }),
    [handleOpenEdit, handleOpenDelete],
  );

  const table = useReactTable({
    data: users,
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

  const handleRoleFilterChange = (value: string | null) => {
    const val = value ?? "all";
    setRoleFilter(val);
    table.getColumn("isAdmin")?.setFilterValue(val);
  };

  const handleCreateSubmit = (formData: UserFormData) => {
    createUserMutation.mutate(formData, {
      onSuccess: () => {
        setIsCreateOpen(false);
      },
    });
  };

  const handleEditSubmit = (formData: UserFormData) => {
    if (!selectedUser) return;

    const payload: Partial<UserFormData> = {
      name: formData.name,
      email: formData.email,
      isAdmin: formData.isAdmin,
      associationIds: formData.associationIds,
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    updateUserMutation.mutate(
      { id: selectedUser.id, payload },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setSelectedUser(null);
        },
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedUser(null);
      },
    });
  };

  const selectedRows = table
    .getFilteredRowModel()
    .rows.filter((row) => row.getIsSelected());
  const selectedUsers = selectedRows.map((row) => row.original);
  const selectedCount = selectedUsers.length;

  const handleBulkDeleteConfirm = () => {
    const ids = selectedUsers.map((u) => u.id);
    if (ids.length === 0) return;

    bulkDeleteUsersMutation.mutate(ids, {
      onSuccess: () => {
        setIsBulkDeleteOpen(false);
        table.resetRowSelection();
      },
    });
  };

  const handleExportSelected = () => {
    if (selectedUsers.length === 0) return;
    const headers = ["ID", "Name", "Email", "Role", "Associations"];
    const rows = selectedUsers.map((u) => {
      const role = u.isAdmin ? "Admin" : "Member";
      const assocs = u.isAdmin
        ? "All Access"
        : (u.associations || []).map((a) => a.acronym || a.name).join("; ");
      return [u.id, u.name, u.email, role, assocs];
    });

    downloadCsv(
      `users_selected_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    );
  };

  const handleClearSelection = () => {
    table.resetRowSelection();
  };

  const handleDownloadCSV = () => {
    const filteredRows = table.getFilteredRowModel().rows;
    const headers = ["ID", "Name", "Email", "Role", "Associations"];
    const rows = filteredRows.map((row) => {
      const u = row.original;
      const role = u.isAdmin ? "Admin" : "Member";
      const assocs = u.isAdmin
        ? "All Access"
        : (u.associations || []).map((a) => a.acronym || a.name).join("; ");
      return [u.id, u.name, u.email, role, assocs];
    });

    downloadCsv(
      `users_export_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    );
  };

  const paginatedRows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Users"
        viewModeToggle={
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        }
        search={
          <div className="relative w-full max-w-50 sm:w-50">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search Users"
              className="h-8 pl-8 text-xs focus-visible:ring-1"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
        }
        actions={
          <>
            {viewMode === "list" && (
              <DataTableColumnToggle
                table={table}
                columnLabels={userColumnLabels}
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
              New Member
            </Button>
          </>
        }
        filters={
          <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
            <SelectTrigger className="h-8 w-fit gap-1 text-xs">
              <span className="text-muted-foreground">Filter by Role</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {isLoading ? (
        <DataLoadingState message="Loading members database..." />
      ) : isError ? (
        <DataErrorState
          title="Failed to load members"
          message={getErrorMessage(error)}
        />
      ) : paginatedRows.length === 0 ? (
        <DataEmptyState
          title="No users found"
          description="Try resetting your filters or search query."
        />
      ) : viewMode === "list" ? (
        <DataTable table={table} />
      ) : (
        <UserGridView
          table={table}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      )}

      <DataTablePagination table={table} />

      <UserBulkActions
        selectedCount={selectedCount}
        onExport={handleExportSelected}
        onDelete={() => setIsBulkDeleteOpen(true)}
        onClear={handleClearSelection}
      />

      <UserFormDialog
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        associations={associations}
        isLoading={createUserMutation.isPending}
        onSubmit={handleCreateSubmit}
      />

      <UserFormDialog
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={selectedUser}
        associations={associations}
        isLoading={updateUserMutation.isPending}
        onSubmit={handleEditSubmit}
      />

      <DeleteUserDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        user={selectedUser}
        isLoading={deleteUserMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        title={`Delete ${selectedCount} ${selectedCount === 1 ? "Member" : "Members"}`}
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {selectedCount} selected{" "}
              {selectedCount === 1 ? "member" : "members"}
            </span>
            ? This action is permanent and cannot be undone.
          </>
        }
        confirmLabel={`Delete ${selectedCount} ${selectedCount === 1 ? "Member" : "Members"}`}
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={bulkDeleteUsersMutation.isPending}
        loadingLabel="Deleting..."
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  );
}

export default AdminUsersPage;
