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
  getUserColumns,
  userColumnLabels,
} from "@/components/admin/users/user-columns";
import { UserFormDialog } from "@/components/admin/users/user-form-dialog";
import { UserGridCard } from "@/components/admin/users/user-grid-card";
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
import {
  DataTableFilter,
  type DataTableFilterOption,
} from "@/components/data-table/data-table-filter";
import { Button } from "@/components/ui/button";
import { type UserFormData, useAdminUsers } from "@/hooks/use-admin-users";
import type { User } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api-client";
import { downloadCsv } from "@/lib/csv-export";
import { getInitials } from "@/lib/utils";

const roleOptions: DataTableFilterOption[] = [
  {
    value: "admin",
    label: "Administrator",
    description: "Full system administrative access",
    initials: "AD",
  },
  {
    value: "user",
    label: "User",
    description: "Standard association member access",
    initials: "US",
  },
];

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

  const [roleFilter, setRoleFilter] = React.useState<string[]>([]);
  const [associationFilter, setAssociationFilter] = React.useState<string[]>(
    [],
  );
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  const associationOptions: DataTableFilterOption[] = React.useMemo(
    () =>
      associations.map((assoc) => ({
        value: String(assoc.id),
        label: assoc.acronym || assoc.name,
        description:
          assoc.acronym && assoc.name && assoc.acronym !== assoc.name
            ? assoc.name
            : undefined,
        initials: getInitials(assoc.acronym || assoc.name, "A"),
      })),
    [associations],
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

  const handleRoleFilterChange = (values: string[]) => {
    setRoleFilter(values);
    table.getColumn("isAdmin")?.setFilterValue(values);
    table.setPageIndex(0);
  };

  const handleAssociationFilterChange = (values: string[]) => {
    setAssociationFilter(values);
    table.getColumn("associations")?.setFilterValue(values);
    table.setPageIndex(0);
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
      <PageHeader
        title="Users"
        viewModeToggle={
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        }
        search={
          <SearchInput
            placeholder="Search Users"
            value={globalFilter}
            onChange={handleSearchChange}
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
            <DataTableFilter
              title="Role"
              pluralTitle="Roles"
              options={roleOptions}
              selectedValues={roleFilter}
              onSelectedValuesChange={handleRoleFilterChange}
            />
            <DataTableFilter
              title="Association"
              pluralTitle="Associations"
              options={associationOptions}
              selectedValues={associationFilter}
              onSelectedValuesChange={handleAssociationFilterChange}
            />
          </>
        }
      />

      <DataTableView
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
          <GridView
            table={t}
            renderCard={(user, { isSelected, onSelectChange }) => (
              <UserGridCard
                user={user}
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
        entityLabel="user"
        entityPluralLabel="users"
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

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        entityName="User"
        itemName={selectedUser?.name}
        isLoading={deleteUserMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      <BulkDeleteDialog
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
