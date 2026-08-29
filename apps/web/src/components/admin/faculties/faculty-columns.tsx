import type { ColumnDef } from "@tanstack/react-table";
import {
  DataTableEntityCell,
  DataTableSortableHeader,
  getActionsColumn,
  getSelectColumn,
} from "@/components/data-table/data-table-column-helpers";
import type { Faculty } from "@/hooks/use-admin-faculties";
import { getInitials } from "@/lib/utils";

export const facultyColumnLabels: Record<string, string> = {
  name: "Name",
  acronym: "Acronym",
  courses: "Courses",
};

export interface GetFacultyColumnsProps {
  onEdit: (faculty: Faculty) => void;
  onDelete: (faculty: Faculty) => void;
}

export function getFacultyColumns({
  onEdit,
  onDelete,
}: GetFacultyColumnsProps): ColumnDef<Faculty>[] {
  return [
    getSelectColumn<Faculty>(),
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableSortableHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const name = row.original.name;
        const acronym = row.original.acronym;
        const initials = getInitials(acronym || name, "F");
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
      accessorKey: "courses",
      header: "Courses",
      cell: ({ row }) => {
        const courses = row.original.courses || [];
        if (courses.length === 0) {
          return (
            <span className="text-xs font-medium text-foreground">None</span>
          );
        }
        return (
          <>
            {courses.map((course, index) => (
              <span
                key={course.id}
                className="text-xs font-medium text-foreground"
              >
                {course.acronym || course.name}
                {index < courses.length - 1 && ", "}
              </span>
            ))}
          </>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true;
        const courses = row.original.courses || [];
        if (Array.isArray(filterValue)) {
          if (filterValue.length === 0 || filterValue.includes("all"))
            return true;
          return courses.some((course) =>
            filterValue.includes(String(course.id)),
          );
        }
        return courses.some(
          (course) => String(course.id) === String(filterValue),
        );
      },
    },
    getActionsColumn<Faculty>({ onEdit, onDelete }),
  ];
}
