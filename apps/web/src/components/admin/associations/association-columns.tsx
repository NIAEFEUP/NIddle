import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit2,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Association } from "@/hooks/use-auth";

export const associationColumnLabels: Record<string, string> = {
  name: "Name",
  acronym: "Acronym",
  members: "Members",
};

interface GetAssociationColumnsProps {
  onEdit: (association: Association) => void;
  onDelete: (association: Association) => void;
}

export function getAssociationColumns({
  onEdit,
  onDelete,
}: GetAssociationColumnsProps): ColumnDef<Association>[] {
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
            Name
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
        const acronym = row.original.acronym;
        const initials = (
          acronym ||
          name
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("") ||
          "A"
        )
          .slice(0, 2)
          .toUpperCase();
        return (
          <div className="flex items-center gap-3 font-medium text-foreground text-sm py-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary aspect-square">
              {initials}
            </div>
            <span>{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "acronym",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-semibold text-muted-foreground uppercase gap-1 px-0 hover:bg-transparent"
          >
            Acronym
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
        const acronym = row.original.acronym;
        if (!acronym) {
          return <span className="text-xs font-medium text-foreground">—</span>;
        }
        return (
          <span className="text-xs font-medium text-foreground">
            {acronym}
          </span>
        );
      },
    },
    {
      id: "members",
      accessorFn: (row) => row.users?.length ?? 0,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-semibold text-muted-foreground uppercase gap-1 px-0 hover:bg-transparent"
          >
            Members
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
        const count = row.original.users?.length ?? 0;
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            <span>
              {count} {count === 1 ? "member" : "members"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const association = row.original;
        return (
          <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="icon-xs"
              className="h-7 w-7"
              onClick={() => onEdit(association)}
            >
              <Edit2 className="size-3" />
            </Button>
            <Button
              variant="outline"
              size="icon-xs"
              className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50/10"
              onClick={() => onDelete(association)}
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
