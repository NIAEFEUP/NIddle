import type { ColumnDef } from "@tanstack/react-table";
import {
  DataTableEntityCell,
  DataTableSortableHeader,
  getActionsColumn,
  getSelectColumn,
} from "@/components/data-table/data-table-column-helpers";
import type { User } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";

export const userColumnLabels: Record<string, string> = {
  name: "Full Name",
  email: "Email",
  isAdmin: "Role",
  associations: "Associations",
};

export interface GetUserColumnsProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function getUserColumns({
  onEdit,
  onDelete,
}: GetUserColumnsProps): ColumnDef<User>[] {
  return [
    getSelectColumn<User>(),
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Full name" />
      ),
      cell: ({ row }) => {
        const name = row.original.name;
        const initials = getInitials(name, "U");
        return <DataTableEntityCell name={name} initials={initials} />;
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: "isAdmin",
      header: "Role",
      cell: ({ row }) => {
        const isAdmin = row.original.isAdmin;
        return (
          <span className="text-xs font-medium text-foreground">
            {isAdmin ? "Admin" : "User"}
          </span>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true;
        if (Array.isArray(filterValue)) {
          if (filterValue.length === 0 || filterValue.includes("all"))
            return true;
          const isAdmin = row.original.isAdmin;
          if (filterValue.includes("admin") && isAdmin) return true;
          if (filterValue.includes("user") && !isAdmin) return true;
          return false;
        }
        if (filterValue === "admin") return row.original.isAdmin === true;
        if (filterValue === "user") return row.original.isAdmin === false;
        return true;
      },
    },
    {
      accessorKey: "associations",
      header: "Associations",
      cell: ({ row }) => {
        const userAssocs = row.original.associations || [];
        if (row.original.isAdmin) {
          return (
            <span className="text-xs font-medium text-foreground">
              All (Admin)
            </span>
          );
        }
        if (userAssocs.length === 0) {
          return (
            <span className="text-xs font-medium text-foreground">None</span>
          );
        }
        return (
          <>
            {userAssocs.map((assoc, index) => (
              <span
                key={assoc.id}
                className="text-xs font-medium text-foreground"
              >
                {assoc.acronym || assoc.name}
                {index < userAssocs.length - 1 && ", "}
              </span>
            ))}
          </>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true;
        const userAssocs = row.original.associations || [];
        if (Array.isArray(filterValue)) {
          if (filterValue.length === 0 || filterValue.includes("all"))
            return true;
          return userAssocs.some((assoc) =>
            filterValue.includes(String(assoc.id)),
          );
        }
        return userAssocs.some(
          (assoc) => String(assoc.id) === String(filterValue),
        );
      },
    },
    getActionsColumn<User>({ onEdit, onDelete }),
  ];
}
