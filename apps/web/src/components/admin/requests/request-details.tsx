import type * as React from "react";
import {
  DetailItem,
  DetailList,
  DetailPanel,
  formatDateTime,
  DetailMuted as Muted,
  DetailSection as Section,
} from "@/components/common/detail-list";
import type { AdminRequest } from "@/hooks/use-admin-requests";
import { useFacultyCourseOptions } from "@/hooks/use-faculty-course-options";

interface ScheduleEntry {
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  description: "Description",
  year: "Year",
  startDate: "Start",
  endDate: "End",
  location: "Location",
  email: "Email",
  phoneNumber: "Phone",
  facultyId: "Faculty",
  courseId: "Course",
  courseIds: "Courses",
  schedule: "Schedule",
};

const FIELD_ORDER: Record<AdminRequest["type"], string[]> = {
  Event: [
    "name",
    "description",
    "year",
    "startDate",
    "endDate",
    "facultyId",
    "courseIds",
  ],
  Service: [
    "name",
    "location",
    "email",
    "phoneNumber",
    "facultyId",
    "courseId",
    "schedule",
  ],
};

const DATE_FIELDS = new Set(["startDate", "endDate"]);

function humanizeKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

export interface RequestDetailsProps {
  request: AdminRequest;
  className?: string;
}

export function RequestDetails({ request, className }: RequestDetailsProps) {
  const { facultiesById, coursesById } = useFacultyCourseOptions();
  const payload = request.payload ?? {};
  const target = request.targetEvent ?? request.targetService;

  const renderEntity = (
    map: Map<string, { name: string; acronym: string }>,
    id: unknown,
  ) => {
    const entity = map.get(String(id));
    if (!entity) return <span className="font-mono">{String(id)}</span>;
    return (
      <>
        {entity.name} <Muted>({entity.acronym})</Muted>
      </>
    );
  };

  const renderValue = (key: string, value: unknown): React.ReactNode => {
    if (value === null || value === undefined || value === "") {
      return <Muted>—</Muted>;
    }
    if (DATE_FIELDS.has(key) && typeof value === "string") {
      return formatDateTime(value);
    }
    if (key === "facultyId") return renderEntity(facultiesById, value);
    if (key === "courseId") return renderEntity(coursesById, value);
    if (key === "courseIds" && Array.isArray(value)) {
      if (value.length === 0) return <Muted>None</Muted>;
      return (
        <ul className="flex flex-col gap-0.5">
          {value.map((id) => (
            <li key={String(id)}>{renderEntity(coursesById, id)}</li>
          ))}
        </ul>
      );
    }
    if (key === "schedule" && Array.isArray(value)) {
      if (value.length === 0) return <Muted>No hours set</Muted>;
      return (
        <ul className="flex flex-col gap-0.5">
          {(value as ScheduleEntry[]).map((entry, index) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: schedule entries have no id
              key={index}
              className="tabular-nums"
            >
              {entry.dayOfWeek} · {entry.startTime}–{entry.endTime}
            </li>
          ))}
        </ul>
      );
    }
    if (key === "description" && typeof value === "string") {
      return <p className="whitespace-pre-wrap">{value}</p>;
    }
    if (typeof value === "object") {
      return (
        <pre className="overflow-x-auto rounded bg-muted p-2 font-mono text-[11px]">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    return String(value);
  };

  const knownKeys = FIELD_ORDER[request.type] ?? [];
  // Update payloads are partial: only list the fields that were sent.
  const payloadKeys = [
    ...knownKeys.filter((key) => request.action === "Create" || key in payload),
    ...Object.keys(payload).filter((key) => !knownKeys.includes(key)),
  ];

  const payloadTitle =
    request.action === "Create"
      ? `New ${request.type.toLowerCase()}`
      : request.action === "Update Existing"
        ? "Proposed changes"
        : "Deletion";

  return (
    <DetailPanel className={className}>
      <Section title={payloadTitle}>
        {request.action === "Delete Existing" ? (
          <p className="text-xs text-foreground">
            Approving will permanently delete the {request.type.toLowerCase()}{" "}
            <span className="font-medium">{target?.name ?? "(not found)"}</span>
            .
          </p>
        ) : payloadKeys.length === 0 ? (
          <p className="text-xs text-muted-foreground">No fields provided.</p>
        ) : (
          <DetailList>
            {payloadKeys.map((key) => (
              <DetailItem
                key={key}
                label={FIELD_LABELS[key] ?? humanizeKey(key)}
              >
                {renderValue(key, payload[key])}
              </DetailItem>
            ))}
          </DetailList>
        )}
      </Section>

      <Section title="Request">
        <DetailList>
          <DetailItem label="ID">
            <span className="font-mono text-[11px]">{request.id}</span>
          </DetailItem>
          {request.action !== "Create" && (
            <DetailItem label={`Target ${request.type.toLowerCase()}`}>
              {target ? (
                <>
                  {target.name}{" "}
                  <Muted>
                    <span className="font-mono text-[11px]">{target.id}</span>
                  </Muted>
                </>
              ) : (
                <Muted>Not found</Muted>
              )}
            </DetailItem>
          )}
          <DetailItem label="Association">
            {request.targetAssociation ? (
              <>
                {request.targetAssociation.name}
                {request.targetAssociation.acronym && (
                  <Muted> ({request.targetAssociation.acronym})</Muted>
                )}
              </>
            ) : (
              <Muted>—</Muted>
            )}
          </DetailItem>
          <DetailItem label="Requested by">
            {request.requestedBy ? (
              <>
                {request.requestedBy.name}
                <br />
                <Muted>{request.requestedBy.email}</Muted>
              </>
            ) : (
              <Muted>Deleted user</Muted>
            )}
          </DetailItem>
          <DetailItem label="Created">
            {formatDateTime(request.createdAt)}
          </DetailItem>
          <DetailItem label="Last updated">
            {formatDateTime(request.updatedAt)}
          </DetailItem>
          <DetailItem label="Reviewed">
            {formatDateTime(request.reviewedAt)}
          </DetailItem>
          {request.rejectionReason && (
            <DetailItem label="Rejection reason">
              <p className="whitespace-pre-wrap">{request.rejectionReason}</p>
            </DetailItem>
          )}
        </DetailList>
      </Section>
    </DetailPanel>
  );
}
