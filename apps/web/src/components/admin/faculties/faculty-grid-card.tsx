import { BookOpen } from "lucide-react";
import { InitialsAvatar } from "@/components/common/initials-avatar";
import { GridCard } from "@/components/data-table/grid-card";
import type { Faculty } from "@/hooks/use-admin-faculties";
import { getInitials } from "@/lib/utils";

export interface FacultyGridCardProps {
  faculty: Faculty;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onEdit: (faculty: Faculty) => void;
  onDelete: (faculty: Faculty) => void;
}

export function FacultyGridCard({
  faculty,
  isSelected = false,
  onSelectChange,
  onEdit,
  onDelete,
}: FacultyGridCardProps) {
  const initials = getInitials(faculty.acronym || faculty.name, "F");
  const courses = faculty.courses || [];
  const courseCount = courses.length;

  return (
    <GridCard
      avatar={<InitialsAvatar initials={initials} size="md" />}
      title={faculty.name}
      subtitle={faculty.acronym}
      isSelected={isSelected}
      onSelectChange={onSelectChange}
      onEdit={() => onEdit(faculty)}
      onDelete={() => onDelete(faculty)}
    >
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Courses:</span>
        <div className="flex items-center gap-1 font-medium text-foreground">
          <BookOpen className="size-3 text-muted-foreground" />
          <span>
            {courseCount} {courseCount === 1 ? "course" : "courses"}
          </span>
        </div>
      </div>
      {courseCount > 0 && (
        <div className="flex justify-between gap-1 mt-1">
          <span className="text-muted-foreground">Offered:</span>
          <div className="text-right">
            {courses.map((course, index) => (
              <span
                key={course.id}
                className="text-xs font-medium text-foreground"
              >
                {course.acronym || course.name}
                {index < courses.length - 1 && ", "}
              </span>
            ))}
          </div>
        </div>
      )}
    </GridCard>
  );
}
