import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { User } from "@/hooks/use-auth";

export const userColumnLabels: Record<string, string> = {
  name: "Full Name",
  email: "Email",
  isAdmin: "Role",
  associations: "Associations",
};

interface GetUserColumnsProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function getUserColumns({
  onEdit,
  onDelete,
}: GetUserColumnsProps): ColumnDef<User>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-semibold text-muted-foreground uppercase gap-1 px-0 hover:bg-transparent"
          >
            Full name
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 size-3 text-foreground" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 size-3 text-foreground" />
            ) : (
              <ArrowUpDown className="ml-1 size-3 opacity-50" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const name = row.original.name;
        const initials = (
          name
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("") || "U"
        )
          .slice(0, 2)
          .toUpperCase();
        return (
          <div className="flex items-center gap-3 font-medium text-foreground text-sm py-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              {initials}
            </div>
            {name}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-semibold text-muted-foreground uppercase gap-1 px-0 hover:bg-transparent"
          >
            Email
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 size-3 text-foreground" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 size-3 text-foreground" />
            ) : (
              <ArrowUpDown className="ml-1 size-3 opacity-50" />
            )}
          </Button>
        );
      },
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
        return userAssocs.some((assoc) => assoc.id === filterValue);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="icon-xs"
              className="h-7 w-7"
              onClick={() => onEdit(user)}
            >
              <Edit2 className="size-3" />
            </Button>
            <Button
              variant="outline"
              size="icon-xs"
              className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50/10"
              onClick={() => onDelete(user)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
