import type { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";
import {
  DataTableEntityCell,
  DataTableSortableHeader,
  getActionsColumn,
  getSelectColumn,
} from "@/components/data-table/data-table-column-helpers";
import { Button } from "@/components/ui/button";
import type { Association } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";

export const associationColumnLabels: Record<string, string> = {
  name: "Name",
  acronym: "Acronym",
  members: "Members",
};

export interface GetAssociationColumnsProps {
  onEdit: (association: Association) => void;
  onDelete: (association: Association) => void;
  onManageMembers: (association: Association) => void;
}

export function getAssociationColumns({
  onEdit,
  onDelete,
  onManageMembers,
}: GetAssociationColumnsProps): ColumnDef<Association>[] {
  return [
    getSelectColumn<Association>(),
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const name = row.original.name;
        const acronym = row.original.acronym;
        const initials = getInitials(acronym || name, "A");
        return <DataTableEntityCell name={name} initials={initials} />;
      },
    },
    {
      accessorKey: "acronym",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Acronym" />
      ),
      cell: ({ row }) => {
        const acronym = row.original.acronym;
        if (!acronym) {
          return <span className="text-xs font-medium text-foreground">—</span>;
        }
        return (
          <span className="text-xs font-medium text-foreground">{acronym}</span>
        );
      },
    },
    {
      id: "members",
      accessorFn: (row) => row.users?.length ?? 0,
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Members" />
      ),
      cell: ({ row }) => {
        const count = row.original.users?.length ?? 0;
        return (
          <button
            type="button"
            onClick={() => onManageMembers(row.original)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-4 cursor-pointer"
          >
            <Users className="size-3.5" />
            <span>
              {count} {count === 1 ? "member" : "members"}
            </span>
          </button>
        );
      },
    },
    getActionsColumn<Association>({
      onEdit,
      onDelete,
      extraActions: (association) => (
        <Button
          variant="outline"
          size="icon-xs"
          className="h-7 w-7"
          onClick={() => onManageMembers(association)}
          aria-label="Manage members"
          title="Manage members"
        >
          <Users className="size-3" />
        </Button>
      ),
    }),
  ];
}
