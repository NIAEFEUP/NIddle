import { GraduationCap } from "lucide-react";
import { InitialsAvatar } from "@/components/common/initials-avatar";
import { GridCard } from "@/components/data-table/grid-card";
import type { Course } from "@/hooks/use-admin-courses";
import { getInitials } from "@/lib/utils";

export interface CourseGridCardProps {
  course: Course;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export function CourseGridCard({
  course,
  isSelected = false,
  onSelectChange,
  onEdit,
  onDelete,
}: CourseGridCardProps) {
  const initials = getInitials(course.acronym || course.name, "C");
  const faculties = course.faculties || [];
  const facultyCount = faculties.length;

  return (
    <GridCard
      avatar={<InitialsAvatar initials={initials} size="md" />}
      title={course.name}
      subtitle={course.acronym}
      isSelected={isSelected}
      onSelectChange={onSelectChange}
      onEdit={() => onEdit(course)}
      onDelete={() => onDelete(course)}
    >
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Faculties:</span>
        <div className="flex items-center gap-1 font-medium text-foreground">
          <GraduationCap className="size-3 text-muted-foreground" />
          <span>
            {facultyCount} {facultyCount === 1 ? "faculty" : "faculties"}
          </span>
        </div>
      </div>
      {facultyCount > 0 && (
        <div className="flex justify-between gap-1 mt-1">
          <span className="text-muted-foreground">Offered at:</span>
          <div className="text-right">
            {faculties.map((faculty, index) => (
              <span
                key={faculty.id}
                className="text-xs font-medium text-foreground"
              >
                {faculty.acronym || faculty.name}
                {index < faculties.length - 1 && ", "}
              </span>
            ))}
          </div>
        </div>
      )}
    </GridCard>
  );
}
