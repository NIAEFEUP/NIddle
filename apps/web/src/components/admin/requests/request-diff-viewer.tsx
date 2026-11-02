import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  FileText,
  Trash2,
} from "lucide-react";
import * as React from "react";
import type {
  RequestItem,
  ScheduleItem,
} from "@/components/admin/requests/request-types";
import { Badge } from "@/components/ui/badge";

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
        {value.map((item: ScheduleItem) => (
          <div
            key={`${item.dayOfWeek}-${item.openingTime}-${item.closingTime}`}
            className="flex items-center gap-2 font-mono"
          >
            <span className="w-24 font-medium text-foreground">
              {DAY_NAMES[item.dayOfWeek] ?? `Day ${item.dayOfWeek}`}:
            </span>
            <span className="text-muted-foreground">
              {item.openingTime} – {item.closingTime}
            </span>
          </div>
        ))}
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

  if (typeof valA === "object" && typeof valB === "object") {
    return JSON.stringify(valA) === JSON.stringify(valB);
  }

  return false;
}

export interface RequestDiffViewerProps {
  request: RequestItem;
}

export function RequestDiffViewer({ request }: RequestDiffViewerProps) {
  const [showRawJson, setShowRawJson] = React.useState(false);
  const [showUnchanged, setShowUnchanged] = React.useState(false);

  const { action, type, payload, targetEvent, targetService } = request;
  const target = targetEvent || targetService || null;

  if (action === "Delete Existing") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <Trash2 className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-destructive">
                Resource Scheduled for Permanent Deletion
              </h4>
              <p className="text-xs text-muted-foreground">
                Approving this request will permanently remove the live{" "}
                {type.toLowerCase()}{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{target?.name || "Unknown item"}&rdquo;
                </span>{" "}
                from the database.
              </p>
            </div>
          </div>
        </div>

        {target && (
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Live Resource Details
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Name:</span>{" "}
                <span className="font-medium text-foreground">
                  {target.name}
                </span>
              </div>
              {target.description && (
                <div className="col-span-full">
                  <span className="text-muted-foreground">Description:</span>{" "}
                  <span className="text-foreground">{target.description}</span>
                </div>
              )}
              {target.location && (
                <div>
                  <span className="text-muted-foreground">Location:</span>{" "}
                  <span className="font-medium text-foreground">
                    {target.location}
                  </span>
                </div>
              )}
              {target.startDate && (
                <div>
                  <span className="text-muted-foreground">Start:</span>{" "}
                  {formatFieldValue("startDate", target.startDate)}
                </div>
              )}
              {target.endDate && (
                <div>
                  <span className="text-muted-foreground">End:</span>{" "}
                  {formatFieldValue("endDate", target.endDate)}
                </div>
              )}
            </div>
          </div>
        )}

        <RawJsonToggle
          show={showRawJson}
          onToggle={() => setShowRawJson(!showRawJson)}
          data={{ target, requestInfo: { id: request.id, type, action } }}
        />
      </div>
    );
  }

  if (action === "Create") {
    const payloadEntries = Object.entries(payload || {});

    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              New {type} Registration Request
            </span>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          >
            {payloadEntries.length} configured fields
          </Badge>
        </div>

        <div className="rounded-lg border bg-card divide-y">
          {payloadEntries.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground italic">
              No payload data provided
            </div>
          ) : (
            payloadEntries.map(([key, val]) => (
              <div
                key={key}
                className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 text-xs"
              >
                <span className="font-medium text-muted-foreground">
                  {FIELD_LABELS[key] || key}
                </span>
                <div className="md:col-span-2 text-foreground font-medium">
                  {formatFieldValue(key, val)}
                </div>
              </div>
            ))
          )}
        </div>

        <RawJsonToggle
          show={showRawJson}
          onToggle={() => setShowRawJson(!showRawJson)}
          data={{ payload }}
        />
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
    <div className="space-y-4">
      {/* Diff overview header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 p-3">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">
            Changes for:{" "}
            <span className="font-semibold">
              {target?.name || "Existing Resource"}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold"
          >
            {changedFields.length}{" "}
            {changedFields.length === 1 ? "field modified" : "fields modified"}
          </Badge>
          {unchangedFields.length > 0 && (
            <Badge variant="outline" className="text-muted-foreground">
              {unchangedFields.length} unchanged
            </Badge>
          )}
        </div>
      </div>

      {/* Changed fields inspection table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="bg-muted px-4 py-2 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Changed Attributes
        </div>
        {changedFields.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground italic">
            No fields differ from the current resource.
          </div>
        ) : (
          <div className="divide-y">
            {changedFields.map(({ key, label, oldVal, newVal }) => (
              <div key={key} className="p-3.5 space-y-2 text-xs">
                <div className="font-semibold text-foreground flex items-center justify-between">
                  <span>{label}</span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    ({key})
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                  {/* Current / Before */}
                  <div className="rounded-md border border-rose-500/20 bg-rose-500/5 p-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
                      Current Value
                    </div>
                    <div className="text-foreground line-through opacity-80">
                      {formatFieldValue(key, oldVal)}
                    </div>
                  </div>

                  {/* Proposed / After */}
                  <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                      <ArrowRight className="size-3" /> Proposed Value
                    </div>
                    <div className="text-foreground font-medium">
                      {formatFieldValue(key, newVal)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unchanged fields collapsible */}
      {unchangedFields.length > 0 && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowUnchanged(!showUnchanged)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
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
                  className="grid grid-cols-1 md:grid-cols-3 gap-2 px-4 py-2 text-xs"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <div className="md:col-span-2 text-foreground">
                    {formatFieldValue(key, val)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Raw JSON toggle */}
      <RawJsonToggle
        show={showRawJson}
        onToggle={() => setShowRawJson(!showRawJson)}
        data={{ proposedPayload: payload, currentResource: target }}
      />
    </div>
  );
}

function RawJsonToggle({
  show,
  onToggle,
  data,
}: {
  show: boolean;
  onToggle: () => void;
  data: any;
}) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Code2 className="size-3.5" />
          Raw JSON Inspection
        </span>
        {show ? (
          <ChevronDown className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
      </button>
      {show && (
        <div className="border-t bg-muted/40 p-3 overflow-x-auto">
          <pre className="text-[11px] font-mono leading-relaxed text-foreground">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
