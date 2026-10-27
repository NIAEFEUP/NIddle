import {
  DetailItem,
  DetailList,
  DetailMuted,
  DetailPanel,
  DetailSection,
  formatDateTime,
} from "@/components/common/detail-list";
import type { AdminEvent } from "@/hooks/use-admin-events";

export interface EventDetailsProps {
  event: AdminEvent;
  className?: string;
}

export function EventDetails({ event, className }: EventDetailsProps) {
  return (
    <DetailPanel className={className}>
      <DetailSection title="Event">
        <DetailList>
          <DetailItem label="Name">{event.name}</DetailItem>
          <DetailItem label="Description">
            {event.description ? (
              <p className="whitespace-pre-wrap">{event.description}</p>
            ) : (
              <DetailMuted>—</DetailMuted>
            )}
          </DetailItem>
          <DetailItem label="Year">{event.year}</DetailItem>
          <DetailItem label="Start">
            {formatDateTime(event.startDate)}
          </DetailItem>
          <DetailItem label="End">{formatDateTime(event.endDate)}</DetailItem>
          <DetailItem label="Faculty">
            {event.faculty ? (
              <>
                {event.faculty.name}{" "}
                <DetailMuted>({event.faculty.acronym})</DetailMuted>
              </>
            ) : (
              <DetailMuted>—</DetailMuted>
            )}
          </DetailItem>
          <DetailItem label="Courses">
            {event.courses.length === 0 ? (
              <DetailMuted>None</DetailMuted>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {event.courses.map((course) => (
                  <li key={course.id}>
                    {course.name} <DetailMuted>({course.acronym})</DetailMuted>
                  </li>
                ))}
              </ul>
            )}
          </DetailItem>
        </DetailList>
      </DetailSection>

      <DetailSection title="Record">
        <DetailList>
          <DetailItem label="ID">
            <span className="font-mono text-[11px]">{event.id}</span>
          </DetailItem>
          <DetailItem label="Association">
            {event.createdBy ? (
              <>
                {event.createdBy.name}
                {event.createdBy.acronym && (
                  <DetailMuted> ({event.createdBy.acronym})</DetailMuted>
                )}
              </>
            ) : (
              <DetailMuted>—</DetailMuted>
            )}
          </DetailItem>
        </DetailList>
      </DetailSection>
    </DetailPanel>
  );
}
