import {
  DetailItem,
  DetailList,
  DetailMuted,
  DetailPanel,
  DetailSection,
} from "@/components/common/detail-list";
import {
  type AdminService,
  sortSchedule,
  toShortTime,
} from "@/hooks/use-admin-services";

export interface ServiceDetailsProps {
  service: AdminService;
  className?: string;
}

function OptionalText({ value }: { value: string | null }) {
  return value ? <>{value}</> : <DetailMuted>—</DetailMuted>;
}

export function ServiceDetails({ service, className }: ServiceDetailsProps) {
  const scope = service.faculty ?? service.course;
  const schedule = sortSchedule(service.schedule ?? []);

  return (
    <DetailPanel className={className}>
      <DetailSection title="Service">
        <DetailList>
          <DetailItem label="Name">{service.name}</DetailItem>
          <DetailItem label="Location">
            <OptionalText value={service.location} />
          </DetailItem>
          <DetailItem label="Email">
            <OptionalText value={service.email} />
          </DetailItem>
          <DetailItem label="Phone">
            <OptionalText value={service.phoneNumber} />
          </DetailItem>
          <DetailItem label={service.course ? "Course" : "Faculty"}>
            {scope ? (
              <>
                {scope.name} <DetailMuted>({scope.acronym})</DetailMuted>
              </>
            ) : (
              <DetailMuted>—</DetailMuted>
            )}
          </DetailItem>
          <DetailItem label="Schedule">
            {schedule.length === 0 ? (
              <DetailMuted>No hours set</DetailMuted>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {schedule.map((entry) => (
                  <li
                    key={`${entry.dayOfWeek}-${entry.startTime}-${entry.endTime}`}
                    className="tabular-nums"
                  >
                    {entry.dayOfWeek} · {toShortTime(entry.startTime)}–
                    {toShortTime(entry.endTime)}
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
            <span className="font-mono text-[11px]">{service.id}</span>
          </DetailItem>
          <DetailItem label="Association">
            {service.createdBy ? (
              <>
                {service.createdBy.name}
                {service.createdBy.acronym && (
                  <DetailMuted> ({service.createdBy.acronym})</DetailMuted>
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
