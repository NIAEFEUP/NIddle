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
  CourseFormData,
  Faculty,
} from "@/hooks/use-admin-courses";
import { getInitials } from "@/lib/utils";

export interface CourseFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
  faculties: Faculty[];
  isLoading: boolean;
  onSubmit: (formData: CourseFormData) => void;
}

function sortFacultiesWithSelectedFirst(
  items: Faculty[],
  selectedIds: number[] = [],
) {
  const selectedSet = new Set(selectedIds);
  const selected = items.filter((faculty) => selectedSet.has(faculty.id));
  const unselected = items.filter((faculty) => !selectedSet.has(faculty.id));
  return [...selected, ...unselected];
}

export function CourseFormDialog({
  mode,
  open,
  onOpenChange,
  course,
  faculties,
  isLoading,
  onSubmit,
}: CourseFormDialogProps) {
  const isEdit = mode === "edit";

  const [formData, setFormData] = React.useState<CourseFormData>({
    name: "",
    acronym: "",
    facultyIds: [],
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
    {},
  );
  const [facultySearch, setFacultySearch] = React.useState("");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [orderedFaculties, setOrderedFaculties] = React.useState<Faculty[]>(
    () => sortFacultiesWithSelectedFirst(faculties, formData.facultyIds),
  );

  React.useEffect(() => {
    if (open) {
      if (isEdit && course) {
        setFormData({
          name: course.name,
          acronym: course.acronym || "",
          facultyIds: course.faculties?.map((f) => f.id) || [],
        });
      } else {
        setFormData({
          name: "",
          acronym: "",
          facultyIds: [],
        });
      }
      setFormErrors({});
      setFacultySearch("");
      setIsDropdownOpen(false);
    }
  }, [open, isEdit, course]);

  React.useEffect(() => {
    if (!isDropdownOpen) {
      setOrderedFaculties(
        sortFacultiesWithSelectedFirst(faculties, formData.facultyIds),
      );
    }
  }, [isDropdownOpen, faculties, formData.facultyIds]);

  const handleDropdownOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOrderedFaculties(
        sortFacultiesWithSelectedFirst(faculties, formData.facultyIds),
      );
    }
    setIsDropdownOpen(nextOpen);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Course name is required.";
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
      facultyIds: formData.facultyIds,
    });
  };

  const toggleFaculty = (id: number) => {
    setFormData((prev) => {
      const activeIds = (prev.facultyIds || []).includes(id)
        ? (prev.facultyIds || []).filter((fid) => fid !== id)
        : [...(prev.facultyIds || []), id];
      return { ...prev, facultyIds: activeIds };
    });
  };

  const clearAllFaculties = () => {
    setFormData((prev) => ({ ...prev, facultyIds: [] }));
  };

  const filteredFaculties = React.useMemo(() => {
    if (!facultySearch.trim()) return orderedFaculties;
    const query = facultySearch.toLowerCase().trim();
    return orderedFaculties.filter(
      (faculty) =>
        faculty.name.toLowerCase().includes(query) ||
        faculty.acronym?.toLowerCase().includes(query),
    );
  }, [orderedFaculties, facultySearch]);

  const selectedFaculties = React.useMemo(() => {
    return faculties.filter((faculty) =>
      (formData.facultyIds || []).includes(faculty.id),
    );
  }, [faculties, formData.facultyIds]);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Course" : "Create Course"}
      description={
        isEdit
          ? "Update the course details below."
          : "Enter the details to create a new course."
      }
      isEdit={isEdit}
      isLoading={isLoading}
      submitLabel={isEdit ? "Save Changes" : "Create Course"}
      onSubmit={handleSubmit}
    >
      <Field data-invalid={!!formErrors.name}>
        <FieldLabel htmlFor="course-name">Name</FieldLabel>
        <Input
          id="course-name"
          placeholder="e.g. Bachelor in Informatics and Computing Engineering"
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
        <FieldLabel htmlFor="course-acronym">Acronym</FieldLabel>
        <Input
          id="course-acronym"
          placeholder="e.g. LEIC"
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
        <FieldLabel>Assigned Faculties</FieldLabel>
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
                disabled={isLoading || faculties.length === 0}
              >
                {selectedFaculties.length === 0 ? (
                  <span className="text-muted-foreground font-medium">
                    {faculties.length === 0
                      ? "No faculties available"
                      : "Select faculties..."}
                  </span>
                ) : selectedFaculties.length === 1 ? (
                  <span className="truncate text-foreground font-medium">
                    {selectedFaculties[0].acronym || selectedFaculties[0].name}
                  </span>
                ) : (
                  <span className="truncate text-foreground font-medium">
                    {selectedFaculties.length} faculties selected
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
                  placeholder="Search faculties..."
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="h-8 pl-8 pr-2 text-xs"
                  autoFocus
                />
              </div>
              {(formData.facultyIds || []).length > 0 && (
                <button
                  type="button"
                  className="text-[11px] text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAllFaculties();
                  }}
                >
                  Clear all
                </button>
              )}
            </div>
            <DropdownMenuGroup>
              <div className="max-h-52 overflow-y-auto space-y-0.5 mt-1">
                {filteredFaculties.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No faculties found
                  </div>
                ) : (
                  filteredFaculties.map((faculty) => {
                    const isSelected = (formData.facultyIds || []).includes(
                      faculty.id,
                    );
                    const displayTitle = faculty.acronym || faculty.name;
                    return (
                      <DropdownMenuCheckboxItem
                        key={faculty.id}
                        checked={isSelected}
                        closeOnClick={false}
                        onCheckedChange={() => toggleFaculty(faculty.id)}
                      >
                        <Avatar className="h-6 w-6 rounded-sm shrink-0 after:rounded-sm">
                          <AvatarFallback className="rounded-sm bg-primary/10 text-primary text-[10px] font-semibold">
                            {getInitials(displayTitle, "F")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 min-w-0 pr-2">
                          <span className="font-medium text-xs truncate">
                            {displayTitle}
                          </span>
                          {faculty.acronym &&
                            faculty.name &&
                            faculty.acronym !== faculty.name && (
                              <span className="text-[10px] text-muted-foreground truncate">
                                {faculty.name}
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
