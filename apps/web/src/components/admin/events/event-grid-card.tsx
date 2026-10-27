import {
  EventTimingBadge,
  formatEventDates,
  getEventAssociationLabel,
} from "@/components/admin/events/event-columns";
import { EventDetails } from "@/components/admin/events/event-details";
import {
  DetailsToggle,
  gridCardDetailPanelClassName,
} from "@/components/common/detail-list";
import { InitialsAvatar } from "@/components/common/initials-avatar";
import { GridCard } from "@/components/data-table/grid-card";
import { type AdminEvent, getEventTiming } from "@/hooks/use-admin-events";
import { getInitials } from "@/lib/utils";

export interface EventGridCardProps {
  event: AdminEvent;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onEdit: (event: AdminEvent) => void;
  onDelete: (event: AdminEvent) => void;
}

export function EventGridCard({
  event,
  isSelected = false,
  onSelectChange,
  isExpanded = false,
  onExpandedChange,
  onEdit,
  onDelete,
}: EventGridCardProps) {
  return (
    <GridCard
      avatar={
        <InitialsAvatar initials={getInitials(event.name, "E")} size="md" />
      }
      title={event.name}
      subtitle={getEventAssociationLabel(event) || undefined}
      badge={<EventTimingBadge timing={getEventTiming(event)} />}
      isSelected={isSelected}
      onSelectChange={onSelectChange}
      onEdit={() => onEdit(event)}
      onDelete={() => onDelete(event)}
    >
      <div className="flex justify-between items-center gap-2">
        <span className="text-muted-foreground">Dates:</span>
        <span className="font-medium text-foreground tabular-nums truncate">
          {formatEventDates(event)}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Faculty:</span>
        <span className="font-medium text-foreground">
          {event.faculty?.acronym || event.faculty?.name || "—"}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Courses:</span>
        <span className="font-medium text-foreground">
          {event.courses.length}
        </span>
      </div>
      {onExpandedChange && (
        <>
          <DetailsToggle
            isExpanded={isExpanded}
            onExpandedChange={onExpandedChange}
          />
          {isExpanded && (
            <EventDetails
              event={event}
              className={gridCardDetailPanelClassName}
            />
          )}
        </>
      )}
    </GridCard>
  );
}
