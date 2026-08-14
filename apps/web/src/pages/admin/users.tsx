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
import { DataTableColumnToggle } from "@/components/data-table/data-table-column-toggle";
import { Button } from "@/components/ui/button";
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

function exportUsersToCsv(usersList: User[], filename: string) {
  const headers = ["ID", "Name", "Email", "Role", "Associations"];
  const rows = usersList.map((u) => {
    const role = u.isAdmin ? "Admin" : "User";
    const assocs = u.isAdmin
      ? "All Access"
      : (u.associations || []).map((a) => a.acronym || a.name).join("; ");
    return [u.id, u.name, u.email, role, assocs];
  });
  downloadCsv(filename, headers, rows);
}

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
  const [associationFilter, setAssociationFilter] = React.useState("all");
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

  const handleRoleFilterChange = (value: string | null) => {
    const val = value ?? "all";
    setRoleFilter(val);
    table.getColumn("isAdmin")?.setFilterValue(val);
  };

  const handleAssociationFilterChange = (value: string | null) => {
    const val = value ?? "all";
    setAssociationFilter(val);
    table.getColumn("associations")?.setFilterValue(val);
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
    exportUsersToCsv(
      selectedUsers,
      `users_selected_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const handleClearSelection = () => {
    table.resetRowSelection();
  };

  const handleDownloadCSV = () => {
    const filteredUsers = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    exportUsersToCsv(
      filteredUsers,
      `users_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Users"
        viewModeToggle={
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        }
        search={
          <AdminSearchInput
            placeholder="Search Users"
            value={globalFilter}
            onChange={setGlobalFilter}
          />
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
              New User
            </Button>
          </>
        }
        filters={
          <>
            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
              <SelectTrigger className="h-8 w-fit gap-1 text-xs">
                <span className="text-muted-foreground">Filter by Role</span>
                <SelectValue>
                  {(val) => {
                    if (val === "admin") return "Administrator";
                    if (val === "user") return "User";
                    return "All Roles";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={associationFilter}
              onValueChange={handleAssociationFilterChange}
            >
              <SelectTrigger className="h-8 w-fit gap-1 text-xs">
                <span className="text-muted-foreground">
                  Filter by Association
                </span>
                <SelectValue>
                  {(val) => {
                    if (!val || val === "all") return "All Associations";
                    const found = associations.find(
                      (a) => String(a.id) === String(val),
                    );
                    return found?.acronym || found?.name || val;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Associations</SelectItem>
                {associations.map((assoc) => (
                  <SelectItem key={assoc.id} value={String(assoc.id)}>
                    {assoc.acronym || assoc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <AdminDataView
        table={table}
        viewMode={viewMode}
        isLoading={isLoading}
        loadingMessage="Loading users database..."
        isError={isError}
        errorTitle="Failed to load users"
        errorMessage={getErrorMessage(error)}
        emptyTitle="No users found"
        emptyDescription="Try resetting your filters or search query."
        renderGrid={(t) => (
          <UserGridView
            table={t}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        )}
      />

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

      <AdminBulkDeleteDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        selectedCount={selectedCount}
        entityLabel="user"
        entityPluralLabel="users"
        isLoading={bulkDeleteUsersMutation.isPending}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  );
}

export default AdminUsersPage;
