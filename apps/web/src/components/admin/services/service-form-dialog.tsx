import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { EntitySelect } from "@/components/common/entity-pickers";
import { FormDialog } from "@/components/common/form-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type AdminService,
  type ScheduleEntry,
  type ServiceFormData,
  sortSchedule,
  toShortTime,
  WEEK_DAYS,
  type WeekDay,
} from "@/hooks/use-admin-services";
import type { FacultyOrCourse } from "@/hooks/use-faculty-course-options";
import { cn } from "@/lib/utils";

export interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: AdminService | null;
  faculties: FacultyOrCourse[];
  courses: FacultyOrCourse[];
  isLoading: boolean;
  onSubmit: (formData: ServiceFormData) => void;
}

type Scope = "faculty" | "course";

interface ScheduleRow extends ScheduleEntry {
  key: number;
}

interface ServiceFormState {
  name: string;
  location: string;
  email: string;
  phoneNumber: string;
  scope: Scope;
  facultyId: string | null;
  courseId: string | null;
  schedule: ScheduleRow[];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let nextRowKey = 0;

function toScheduleRow(entry: ScheduleEntry): ScheduleRow {
  return {
    key: nextRowKey++,
    dayOfWeek: entry.dayOfWeek,
    startTime: toShortTime(entry.startTime),
    endTime: toShortTime(entry.endTime),
  };
}

function toFormState(service: AdminService | null): ServiceFormState {
  return {
    name: service?.name ?? "",
    location: service?.location ?? "",
    email: service?.email ?? "",
    phoneNumber: service?.phoneNumber ?? "",
    scope: service?.course ? "course" : "faculty",
    facultyId: service?.faculty ? String(service.faculty.id) : null,
    courseId: service?.course ? String(service.course.id) : null,
    schedule: sortSchedule(service?.schedule ?? []).map(toScheduleRow),
  };
}

const dayItems = WEEK_DAYS.map((day) => ({ value: day, label: day }));

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  faculties,
  courses,
  isLoading,
  onSubmit,
}: ServiceFormDialogProps) {
  const [formData, setFormData] = React.useState<ServiceFormState>(() =>
    toFormState(service),
  );
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
    {},
  );

  React.useEffect(() => {
    if (open) {
      setFormData(toFormState(service));
      setFormErrors({});
    }
  }, [open, service]);

  const setField = <K extends keyof ServiceFormState>(
    key: K,
    value: ServiceFormState[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const updateScheduleRow = (key: number, patch: Partial<ScheduleEntry>) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((row) =>
        row.key === key ? { ...row, ...patch } : row,
      ),
    }));
    if (formErrors.schedule) {
      setFormErrors((prev) => ({ ...prev, schedule: "" }));
    }
  };

  const addScheduleRow = () => {
    setFormData((prev) => {
      const last = prev.schedule.at(-1);
      const nextDay =
        WEEK_DAYS[(WEEK_DAYS.indexOf(last?.dayOfWeek ?? "Sunday") + 1) % 7];
      return {
        ...prev,
        schedule: [
          ...prev.schedule,
          toScheduleRow({
            dayOfWeek: nextDay,
            startTime: last?.startTime ?? "09:00",
            endTime: last?.endTime ?? "18:00",
          }),
        ],
      };
    });
  };

  const removeScheduleRow = (key: number) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((row) => row.key !== key),
    }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Service name is required.";
    }
    if (!formData.location.trim()) {
      errors.location = "Location is required.";
    }
    if (formData.email.trim() && !EMAIL_PATTERN.test(formData.email.trim())) {
      errors.email = "Invalid email format.";
    }
    const scopeId =
      formData.scope === "faculty" ? formData.facultyId : formData.courseId;
    if (!scopeId) {
      errors.scope = `Select a ${formData.scope}.`;
    }
    const badRow = formData.schedule.find(
      (row) => !row.startTime || !row.endTime || row.endTime <= row.startTime,
    );
    if (badRow) {
      errors.schedule = `${badRow.dayOfWeek}: closing time must be after opening time.`;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: formData.name.trim(),
      location: formData.location.trim(),
      email: formData.email.trim() || null,
      phoneNumber: formData.phoneNumber.trim() || null,
      ...(formData.scope === "faculty"
        ? { facultyId: formData.facultyId ?? undefined }
        : { courseId: formData.courseId ?? undefined }),
      schedule: formData.schedule.map(({ dayOfWeek, startTime, endTime }) => ({
        dayOfWeek,
        startTime,
        endTime,
      })),
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Service"
      description="Update the service details below."
      isEdit
      isLoading={isLoading}
      onSubmit={handleSubmit}
      className="max-w-lg max-h-[90vh] overflow-y-auto"
    >
      <Field data-invalid={!!formErrors.name}>
        <FieldLabel htmlFor="service-name">Name</FieldLabel>
        <Input
          id="service-name"
          value={formData.name}
          onChange={(e) => setField("name", e.target.value)}
          disabled={isLoading}
        />
        {formErrors.name && <FieldError>{formErrors.name}</FieldError>}
      </Field>

      <Field data-invalid={!!formErrors.location}>
        <FieldLabel htmlFor="service-location">Location</FieldLabel>
        <Input
          id="service-location"
          placeholder="e.g. B-142"
          value={formData.location}
          onChange={(e) => setField("location", e.target.value)}
          disabled={isLoading}
        />
        {formErrors.location && <FieldError>{formErrors.location}</FieldError>}
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field data-invalid={!!formErrors.email}>
          <FieldLabel htmlFor="service-email">Email</FieldLabel>
          <Input
            id="service-email"
            type="email"
            value={formData.email}
            onChange={(e) => setField("email", e.target.value)}
            disabled={isLoading}
          />
          {formErrors.email && <FieldError>{formErrors.email}</FieldError>}
        </Field>
        <Field>
          <FieldLabel htmlFor="service-phone">Phone</FieldLabel>
          <Input
            id="service-phone"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setField("phoneNumber", e.target.value)}
            disabled={isLoading}
          />
        </Field>
      </div>

      <Field data-invalid={!!formErrors.scope}>
        <FieldLabel htmlFor="service-scope">Belongs to</FieldLabel>
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-input p-0.5">
          {(["faculty", "course"] as const).map((scope) => (
            <button
              key={scope}
              type="button"
              className={cn(
                "h-7 rounded-md text-xs font-medium capitalize transition-colors",
                formData.scope === scope
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setField("scope", scope)}
              aria-pressed={formData.scope === scope}
              disabled={isLoading}
            >
              {scope}
            </button>
          ))}
        </div>
        {formData.scope === "faculty" ? (
          <EntitySelect
            id="service-scope"
            options={faculties}
            value={formData.facultyId}
            onValueChange={(value) => setField("facultyId", value)}
            placeholder="Select a faculty..."
            disabled={isLoading}
          />
        ) : (
          <EntitySelect
            id="service-scope"
            options={courses}
            value={formData.courseId}
            onValueChange={(value) => setField("courseId", value)}
            placeholder="Select a course..."
            disabled={isLoading}
          />
        )}
        {formErrors.scope && <FieldError>{formErrors.scope}</FieldError>}
      </Field>

      <Field data-invalid={!!formErrors.schedule}>
        <FieldLabel>Schedule</FieldLabel>
        {formData.schedule.length === 0 ? (
          <p className="text-xs text-muted-foreground">No hours set.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {formData.schedule.map((row) => (
              <li key={row.key} className="flex items-center gap-2">
                <Select
                  items={dayItems}
                  value={row.dayOfWeek}
                  onValueChange={(value) =>
                    value &&
                    updateScheduleRow(row.key, { dayOfWeek: value as WeekDay })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className="h-8 w-32 text-xs"
                    aria-label="Day of week"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEK_DAYS.map((day) => (
                      <SelectItem key={day} value={day} className="text-xs">
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="time"
                  value={row.startTime}
                  onChange={(e) =>
                    updateScheduleRow(row.key, { startTime: e.target.value })
                  }
                  className="h-8 flex-1 text-xs tabular-nums"
                  aria-label="Opens at"
                  disabled={isLoading}
                />
                <span className="text-xs text-muted-foreground">–</span>
                <Input
                  type="time"
                  value={row.endTime}
                  onChange={(e) =>
                    updateScheduleRow(row.key, { endTime: e.target.value })
                  }
                  className="h-8 flex-1 text-xs tabular-nums"
                  aria-label="Closes at"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-rose-500"
                  onClick={() => removeScheduleRow(row.key)}
                  aria-label={`Remove ${row.dayOfWeek} slot`}
                  disabled={isLoading}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 self-start gap-1.5 text-xs"
          onClick={addScheduleRow}
          disabled={isLoading}
        >
          <Plus className="size-3.5" />
          Add time slot
        </Button>
        {formErrors.schedule && <FieldError>{formErrors.schedule}</FieldError>}
      </Field>
    </FormDialog>
  );
}
