import type { ColumnDef } from "@tanstack/react-table";
import {
  DataTableEntityCell,
  DataTableSortableHeader,
  getActionsColumn,
  getSelectColumn,
} from "@/components/data-table/data-table-column-helpers";
import type { Course } from "@/hooks/use-admin-courses";
import { getInitials } from "@/lib/utils";

export const courseColumnLabels: Record<string, string> = {
  name: "Name",
  acronym: "Acronym",
  faculties: "Faculties",
};

export interface GetCourseColumnsProps {
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export function getCourseColumns({
  onEdit,
  onDelete,
}: GetCourseColumnsProps): ColumnDef<Course>[] {
  return [
    getSelectColumn<Course>(),
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const name = row.original.name;
        const acronym = row.original.acronym;
        const initials = getInitials(acronym || name, "C");
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
      accessorKey: "faculties",
      header: "Faculties",
      cell: ({ row }) => {
        const faculties = row.original.faculties || [];
        if (faculties.length === 0) {
          return (
            <span className="text-xs font-medium text-foreground">None</span>
          );
        }
        return (
          <>
            {faculties.map((faculty, index) => (
              <span
                key={faculty.id}
                className="text-xs font-medium text-foreground"
              >
                {faculty.acronym || faculty.name}
                {index < faculties.length - 1 && ", "}
              </span>
            ))}
          </>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true;
        const faculties = row.original.faculties || [];
        if (Array.isArray(filterValue)) {
          if (filterValue.length === 0 || filterValue.includes("all"))
            return true;
          return faculties.some((faculty) =>
            filterValue.includes(String(faculty.id)),
          );
        }
        return faculties.some(
          (faculty) => String(faculty.id) === String(filterValue),
        );
      },
    },
    getActionsColumn<Course>({ onEdit, onDelete }),
  ];
}
