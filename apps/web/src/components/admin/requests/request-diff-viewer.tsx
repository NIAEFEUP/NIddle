import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";
import type {
  RequestItem,
  ScheduleItem,
} from "@/components/admin/requests/request-types";

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  description: "Description",
  year: "Year",
  startDate: "Start Date",
  endDate: "End Date",
  location: "Location",
  email: "Contact Email",
  phoneNumber: "Phone Number",
  schedule: "Weekly Schedule",
  facultyId: "Faculty ID",
  courseId: "Course ID",
  courseIds: "Course IDs",
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatDayName(day: number | string | undefined | null): string {
  if (day === undefined || day === null) return "Unknown";
  if (typeof day === "number") {
    return DAY_NAMES[day] ?? `Day ${day}`;
  }
  if (typeof day === "string") {
    const num = Number.parseInt(day, 10);
    if (!Number.isNaN(num) && DAY_NAMES[num]) {
      return DAY_NAMES[num];
    }
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  }
  return String(day);
}

function cleanTime(timeStr?: any): string {
  if (!timeStr || typeof timeStr !== "string") return "";
  const match = timeStr.match(/^(\d{1,2}:\d{2})(?::\d{2})?$/);
  return match ? match[1] : timeStr;
}

function formatScheduleTime(item: ScheduleItem | Record<string, any>): string {
  const startRaw =
    item.startTime ?? item.openingTime ?? item.start ?? item.open;
  const endRaw = item.endTime ?? item.closingTime ?? item.end ?? item.close;

  const start = cleanTime(startRaw);
  const end = cleanTime(endRaw);

  if (start && end) {
    return `${start} – ${end}`;
  }
  if (start) {
    return `From ${start}`;
  }
  if (end) {
    return `Until ${end}`;
  }
  return "Hours not specified";
}

function formatFieldValue(key: string, value: any): React.ReactNode {
  if (value === undefined || value === null || value === "") {
    return <span className="italic text-muted-foreground">Empty</span>;
  }

  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }

  if (key === "startDate" || key === "endDate") {
    try {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return (
          <span className="font-mono text-xs">
            {date.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        );
      }
    } catch {}
  }

  if (key === "schedule" && Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <span className="italic text-muted-foreground">
          No schedule specified
        </span>
      );
    }
    return (
      <div className="flex flex-col gap-1 text-xs">
        {value.map((item: any) => {
          if (typeof item === "string") {
            return (
              <div key={item} className="font-mono text-muted-foreground">
                {item}
              </div>
            );
          }
          const dayName = formatDayName(item.dayOfWeek);
          const time = formatScheduleTime(item);

          return (
            <div
              key={`${dayName}-${time}`}
              className="flex items-center gap-3 font-mono"
            >
              <span className="w-24 font-medium text-foreground">
                {dayName}:
              </span>
              <span className="text-muted-foreground">{time}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0)
      return <span className="italic text-muted-foreground">None</span>;
    return value.join(", ");
  }

  if (typeof value === "object") {
    return (
      <pre className="text-xs font-mono">{JSON.stringify(value, null, 2)}</pre>
    );
  }

  return String(value);
}

function areSchedulesEqual(schedA: any[], schedB: any[]): boolean {
  if (schedA.length !== schedB.length) return false;
  return schedA.every((itemA, i) => {
    const itemB = schedB[i];
    if (!itemB) return false;
    const dayA = formatDayName(itemA.dayOfWeek);
    const dayB = formatDayName(itemB.dayOfWeek);
    const timeA = formatScheduleTime(itemA);
    const timeB = formatScheduleTime(itemB);
    return dayA === dayB && timeA === timeB;
  });
}

function areValuesEqual(valA: any, valB: any): boolean {
  if (valA === valB) return true;
  if (
    (valA === undefined || valA === null || valA === "") &&
    (valB === undefined || valB === null || valB === "")
  ) {
    return true;
  }

  if (
    valA instanceof Date ||
    (typeof valA === "string" && !Number.isNaN(Date.parse(valA)))
  ) {
    const timeA = new Date(valA).getTime();
    const timeB = new Date(valB).getTime();
    if (!Number.isNaN(timeA) && !Number.isNaN(timeB)) {
      return timeA === timeB;
    }
  }

  if (Array.isArray(valA) && Array.isArray(valB)) {
    const isSchedA =
      valA.length > 0 &&
      (valA[0]?.dayOfWeek !== undefined ||
        valA[0]?.startTime !== undefined ||
        valA[0]?.openingTime !== undefined);
    const isSchedB =
      valB.length > 0 &&
      (valB[0]?.dayOfWeek !== undefined ||
        valB[0]?.startTime !== undefined ||
        valB[0]?.openingTime !== undefined);

    if (isSchedA || isSchedB) {
      return areSchedulesEqual(valA, valB);
    }
    return JSON.stringify(valA) === JSON.stringify(valB);
  }

  if (typeof valA === "object" && typeof valB === "object") {
    return JSON.stringify(valA) === JSON.stringify(valB);
  }

  return false;
}

export interface RequestDiffViewerProps {
  request: RequestItem;
}

export function RequestDiffViewer({ request }: RequestDiffViewerProps) {
  const [showUnchanged, setShowUnchanged] = React.useState(false);

  const { action, payload, targetEvent, targetService } = request;
  const target = targetEvent || targetService || null;

  if (action === "Delete Existing") {
    if (!target) {
      return (
        <div className="rounded-lg border bg-card p-4 text-center text-xs text-muted-foreground italic">
          Resource details not found
        </div>
      );
    }

    const targetEntries = Object.entries(target).filter(
      ([key, val]) =>
        !["id", "associationId", "createdAt", "updatedAt"].includes(key) &&
        val !== undefined &&
        val !== null &&
        val !== "",
    );

    return (
      <div className="space-y-3">
        <div className="rounded-lg border bg-card divide-y">
          {targetEntries.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground italic">
              No resource attributes available
            </div>
          ) : (
            targetEntries.map(([key, val]) => (
              <div
                key={key}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-3.5 py-2 text-xs"
              >
                <span className="font-medium text-muted-foreground">
                  {FIELD_LABELS[key] || key}
                </span>
                <div className="sm:col-span-2 text-foreground font-medium break-words">
                  {formatFieldValue(key, val)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (action === "Create") {
    const payloadEntries = Object.entries(payload || {});

    return (
      <div className="space-y-3">
        <div className="rounded-lg border bg-card divide-y">
          {payloadEntries.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground italic">
              No payload data provided
            </div>
          ) : (
            payloadEntries.map(([key, val]) => (
              <div
                key={key}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-3.5 py-2 text-xs"
              >
                <span className="font-medium text-muted-foreground">
                  {FIELD_LABELS[key] || key}
                </span>
                <div className="sm:col-span-2 text-foreground font-medium break-words">
                  {formatFieldValue(key, val)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // action === "Update Existing"
  // Compute diff
  const allKeys = Array.from(new Set([...Object.keys(payload || {})]));

  const changedFields: Array<{
    key: string;
    label: string;
    oldVal: any;
    newVal: any;
  }> = [];

  const unchangedFields: Array<{
    key: string;
    label: string;
    val: any;
  }> = [];

  for (const key of allKeys) {
    const newVal = payload?.[key];
    const oldVal = target?.[key];

    if (!areValuesEqual(oldVal, newVal)) {
      changedFields.push({
        key,
        label: FIELD_LABELS[key] || key,
        oldVal,
        newVal,
      });
    } else {
      unchangedFields.push({
        key,
        label: FIELD_LABELS[key] || key,
        val: newVal,
      });
    }
  }

  return (
    <div className="space-y-3">
      {/* Diff overview summary */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">
          {changedFields.length}{" "}
          {changedFields.length === 1 ? "field modified" : "fields modified"}
        </span>
        {unchangedFields.length > 0 && (
          <span className="text-muted-foreground">
            {unchangedFields.length} unchanged
          </span>
        )}
      </div>

      {/* Changed fields inspection table */}
      <div className="rounded-lg border bg-card divide-y overflow-hidden">
        {changedFields.length === 0 ? (
          <div className="p-3 text-center text-xs text-muted-foreground italic">
            No fields differ from the current resource.
          </div>
        ) : (
          changedFields.map(({ key, label, oldVal, newVal }) => (
            <div key={key} className="p-3 space-y-1.5 text-xs">
              <div className="font-medium text-foreground flex items-center justify-between">
                <span>{label}</span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {key}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
                {/* Current / Before */}
                <div className="rounded-md border bg-muted/40 p-2 space-y-0.5">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Current
                  </div>
                  <div className="text-muted-foreground line-through break-words">
                    {formatFieldValue(key, oldVal)}
                  </div>
                </div>

                {/* Proposed / After */}
                <div className="rounded-md border bg-background p-2 space-y-0.5">
                  <div className="text-[10px] font-medium text-foreground uppercase tracking-wider flex items-center gap-1">
                    <ArrowRight className="size-3 text-muted-foreground" />{" "}
                    Proposed
                  </div>
                  <div className="text-foreground font-medium break-words">
                    {formatFieldValue(key, newVal)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Unchanged fields collapsible */}
      {unchangedFields.length > 0 && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowUnchanged(!showUnchanged)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <span>
              {showUnchanged ? "Hide" : "Show"} {unchangedFields.length}{" "}
              unchanged {unchangedFields.length === 1 ? "field" : "fields"}
            </span>
            {showUnchanged ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
          {showUnchanged && (
            <div className="divide-y border-t bg-muted/20">
              {unchangedFields.map(({ key, label, val }) => (
                <div
                  key={key}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-3.5 py-1.5 text-xs"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <div className="sm:col-span-2 text-foreground">
                    {formatFieldValue(key, val)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
