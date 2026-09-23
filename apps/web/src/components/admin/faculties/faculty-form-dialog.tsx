import { ChevronsUpDown, Search } from "lucide-react";
import * as React from "react";
import { FormDialog } from "@/components/common/form-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type {
  Course,
  Faculty,
  FacultyFormData,
} from "@/hooks/use-admin-faculties";
import { getInitials } from "@/lib/utils";

export interface FacultyFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty?: Faculty | null;
  courses: Course[];
  isLoading: boolean;
  onSubmit: (formData: FacultyFormData) => void;
}

function sortCoursesWithSelectedFirst(
  items: Course[],
  selectedIds: number[] = [],
) {
  const selectedSet = new Set(selectedIds);
  const selected = items.filter((course) => selectedSet.has(course.id));
  const unselected = items.filter((course) => !selectedSet.has(course.id));
  return [...selected, ...unselected];
}

export function FacultyFormDialog({
  mode,
  open,
  onOpenChange,
  faculty,
  courses,
  isLoading,
  onSubmit,
}: FacultyFormDialogProps) {
  const isEdit = mode === "edit";

  const [formData, setFormData] = React.useState<FacultyFormData>({
    name: "",
    acronym: "",
    courseIds: [],
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
    {},
  );
  const [courseSearch, setCourseSearch] = React.useState("");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [orderedCourses, setOrderedCourses] = React.useState<Course[]>(() =>
    sortCoursesWithSelectedFirst(courses, formData.courseIds),
  );

  React.useEffect(() => {
    if (open) {
      if (isEdit && faculty) {
        setFormData({
          name: faculty.name,
          acronym: faculty.acronym || "",
          courseIds: faculty.courses?.map((c) => c.id) || [],
        });
      } else {
        setFormData({
          name: "",
          acronym: "",
          courseIds: [],
        });
      }
      setFormErrors({});
      setCourseSearch("");
      setIsDropdownOpen(false);
    }
  }, [open, isEdit, faculty]);

  React.useEffect(() => {
    if (!isDropdownOpen) {
      setOrderedCourses(
        sortCoursesWithSelectedFirst(courses, formData.courseIds),
      );
    }
  }, [isDropdownOpen, courses, formData.courseIds]);

  const handleDropdownOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOrderedCourses(
        sortCoursesWithSelectedFirst(courses, formData.courseIds),
      );
    }
    setIsDropdownOpen(nextOpen);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Faculty name is required.";
    }
    if (!formData.acronym.trim()) {
      errors.acronym = "Acronym is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: formData.name.trim(),
      acronym: formData.acronym.trim(),
      courseIds: formData.courseIds,
    });
  };

  const toggleCourse = (id: number) => {
    setFormData((prev) => {
      const activeIds = (prev.courseIds || []).includes(id)
        ? (prev.courseIds || []).filter((cid) => cid !== id)
        : [...(prev.courseIds || []), id];
      return { ...prev, courseIds: activeIds };
    });
  };

  const clearAllCourses = () => {
    setFormData((prev) => ({ ...prev, courseIds: [] }));
  };

  const filteredCourses = React.useMemo(() => {
    if (!courseSearch.trim()) return orderedCourses;
    const query = courseSearch.toLowerCase().trim();
    return orderedCourses.filter(
      (course) =>
        course.name.toLowerCase().includes(query) ||
        course.acronym?.toLowerCase().includes(query),
    );
  }, [orderedCourses, courseSearch]);

  const selectedCourses = React.useMemo(() => {
    return courses.filter((course) =>
      (formData.courseIds || []).includes(course.id),
    );
  }, [courses, formData.courseIds]);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Faculty" : "Create Faculty"}
      description={
        isEdit
          ? "Update the faculty details below."
          : "Enter the details to create a new faculty."
      }
      isEdit={isEdit}
      isLoading={isLoading}
      submitLabel={isEdit ? "Save Changes" : "Create Faculty"}
      onSubmit={handleSubmit}
    >
      <Field data-invalid={!!formErrors.name}>
        <FieldLabel htmlFor="faculty-name">Name</FieldLabel>
        <Input
          id="faculty-name"
          placeholder="e.g. Faculty of Engineering of the University of Porto"
          value={formData.name}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, name: e.target.value }));
            if (formErrors.name) {
              setFormErrors((prev) => ({ ...prev, name: "" }));
            }
          }}
          disabled={isLoading}
        />
        {formErrors.name && <FieldError>{formErrors.name}</FieldError>}
      </Field>

      <Field data-invalid={!!formErrors.acronym}>
        <FieldLabel htmlFor="faculty-acronym">Acronym</FieldLabel>
        <Input
          id="faculty-acronym"
          placeholder="e.g. FEUP"
          value={formData.acronym}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, acronym: e.target.value }));
            if (formErrors.acronym) {
              setFormErrors((prev) => ({ ...prev, acronym: "" }));
            }
          }}
          disabled={isLoading}
        />
        {formErrors.acronym && <FieldError>{formErrors.acronym}</FieldError>}
      </Field>

      <Field>
        <FieldLabel>Assigned Courses</FieldLabel>
        <DropdownMenu
          open={isDropdownOpen}
          onOpenChange={handleDropdownOpenChange}
        >
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={isDropdownOpen}
                className="w-full justify-between font-normal h-9 px-3 text-xs border-input hover:bg-accent/50"
                disabled={isLoading || courses.length === 0}
              >
                {selectedCourses.length === 0 ? (
                  <span className="text-muted-foreground font-medium">
                    {courses.length === 0
                      ? "No courses available"
                      : "Select courses..."}
                  </span>
                ) : selectedCourses.length === 1 ? (
                  <span className="truncate text-foreground font-medium">
                    {selectedCourses[0].acronym || selectedCourses[0].name}
                  </span>
                ) : (
                  <span className="truncate text-foreground font-medium">
                    {selectedCourses.length} courses selected
                  </span>
                )}
                <ChevronsUpDown className="size-3.5 shrink-0 opacity-50 ml-2" />
              </Button>
            }
          />
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-72 p-2"
            align="start"
            sideOffset={4}
          >
            <div className="flex flex-row items-center justify-between gap-2 p-1.5">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search courses..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="h-8 pl-8 pr-2 text-xs"
                  autoFocus
                />
              </div>
              {(formData.courseIds || []).length > 0 && (
                <button
                  type="button"
                  className="text-[11px] text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAllCourses();
                  }}
                >
                  Clear all
                </button>
              )}
            </div>
            <DropdownMenuGroup>
              <div className="max-h-52 overflow-y-auto space-y-0.5 mt-1">
                {filteredCourses.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No courses found
                  </div>
                ) : (
                  filteredCourses.map((course) => {
                    const isSelected = (formData.courseIds || []).includes(
                      course.id,
                    );
                    const displayTitle = course.acronym || course.name;
                    return (
                      <DropdownMenuCheckboxItem
                        key={course.id}
                        checked={isSelected}
                        closeOnClick={false}
                        onCheckedChange={() => toggleCourse(course.id)}
                      >
                        <Avatar className="h-6 w-6 rounded-sm shrink-0 after:rounded-sm">
                          <AvatarFallback className="rounded-sm bg-primary/10 text-primary text-[10px] font-semibold">
                            {getInitials(displayTitle, "C")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 min-w-0 pr-2">
                          <span className="font-medium text-xs truncate">
                            {displayTitle}
                          </span>
                          {course.acronym &&
                            course.name &&
                            course.acronym !== course.name && (
                              <span className="text-[10px] text-muted-foreground truncate">
                                {course.name}
                              </span>
                            )}
                        </div>
                      </DropdownMenuCheckboxItem>
                    );
                  })
                )}
              </div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Field>
    </FormDialog>
  );
}
