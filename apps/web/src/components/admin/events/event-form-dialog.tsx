import * as React from "react";
import {
  EntityMultiSelect,
  EntitySelect,
} from "@/components/common/entity-pickers";
import { FormDialog } from "@/components/common/form-dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { AdminEvent, EventFormData } from "@/hooks/use-admin-events";
import type { FacultyOrCourse } from "@/hooks/use-faculty-course-options";

export interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: AdminEvent | null;
  faculties: FacultyOrCourse[];
  courses: FacultyOrCourse[];
  isLoading: boolean;
  onSubmit: (formData: EventFormData) => void;
}

interface EventFormState {
  name: string;
  description: string;
  year: string;
  startDate: string;
  endDate: string;
  facultyId: string | null;
  courseIds: string[];
}

/** ISO timestamp -> value for a datetime-local input, in the browser's timezone. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromLocalInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

function toFormState(event: AdminEvent | null): EventFormState {
  return {
    name: event?.name ?? "",
    description: event?.description ?? "",
    year: event ? String(event.year) : String(new Date().getFullYear()),
    startDate: toLocalInput(event?.startDate ?? null),
    endDate: toLocalInput(event?.endDate ?? null),
    facultyId: event?.faculty ? String(event.faculty.id) : null,
    courseIds: event?.courses.map((course) => String(course.id)) ?? [],
  };
}

export function EventFormDialog({
  open,
  onOpenChange,
  event,
  faculties,
  courses,
  isLoading,
  onSubmit,
}: EventFormDialogProps) {
  const [formData, setFormData] = React.useState<EventFormState>(() =>
    toFormState(event),
  );
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
    {},
  );

  React.useEffect(() => {
    if (open) {
      setFormData(toFormState(event));
      setFormErrors({});
    }
  }, [open, event]);

  const setField = <K extends keyof EventFormState>(
    key: K,
    value: EventFormState[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Event name is required.";
    }
    if (!/^\d{4}$/.test(formData.year.trim())) {
      errors.year = "Enter a four-digit year.";
    }
    if (formData.endDate && !formData.startDate) {
      errors.startDate = "Set a start date before setting an end date.";
    }
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      errors.endDate = "End must be after the start.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      year: Number(formData.year),
      startDate: fromLocalInput(formData.startDate),
      endDate: fromLocalInput(formData.endDate),
      facultyId: formData.facultyId,
      courseIds: formData.courseIds,
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Event"
      description="Update the event details below."
      isEdit
      isLoading={isLoading}
      onSubmit={handleSubmit}
      className="max-w-lg max-h-[90vh] overflow-y-auto"
    >
      <Field data-invalid={!!formErrors.name}>
        <FieldLabel htmlFor="event-name">Name</FieldLabel>
        <Input
          id="event-name"
          value={formData.name}
          onChange={(e) => setField("name", e.target.value)}
          disabled={isLoading}
        />
        {formErrors.name && <FieldError>{formErrors.name}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="event-description">Description</FieldLabel>
        <textarea
          id="event-description"
          rows={4}
          value={formData.description}
          onChange={(e) => setField("description", e.target.value)}
          disabled={isLoading}
          className="w-full min-w-0 resize-y rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
        />
      </Field>

      <Field data-invalid={!!formErrors.year}>
        <FieldLabel htmlFor="event-year">Year</FieldLabel>
        <Input
          id="event-year"
          inputMode="numeric"
          value={formData.year}
          onChange={(e) => setField("year", e.target.value)}
          disabled={isLoading}
        />
        {formErrors.year && <FieldError>{formErrors.year}</FieldError>}
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field data-invalid={!!formErrors.startDate}>
          <FieldLabel htmlFor="event-start">Start</FieldLabel>
          <Input
            id="event-start"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setField("startDate", e.target.value)}
            disabled={isLoading}
          />
          {formErrors.startDate && (
            <FieldError>{formErrors.startDate}</FieldError>
          )}
        </Field>
        <Field data-invalid={!!formErrors.endDate}>
          <FieldLabel htmlFor="event-end">End</FieldLabel>
          <Input
            id="event-end"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setField("endDate", e.target.value)}
            disabled={isLoading}
          />
          {formErrors.endDate && <FieldError>{formErrors.endDate}</FieldError>}
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="event-faculty">Faculty</FieldLabel>
        <EntitySelect
          id="event-faculty"
          options={faculties}
          value={formData.facultyId}
          onValueChange={(value) => setField("facultyId", value)}
          placeholder="Select a faculty..."
          noneLabel="No faculty"
          disabled={isLoading}
        />
      </Field>

      <Field>
        <FieldLabel>Courses</FieldLabel>
        <EntityMultiSelect
          options={courses}
          value={formData.courseIds}
          onValueChange={(value) => setField("courseIds", value)}
          placeholder="Select courses..."
          pluralLabel="courses"
          disabled={isLoading}
        />
      </Field>
    </FormDialog>
  );
}
