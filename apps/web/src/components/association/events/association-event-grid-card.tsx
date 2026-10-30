import { Edit2, Trash2 } from "lucide-react";
import {
  EventTimingBadge,
  formatEventDates,
} from "@/components/admin/events/event-columns";
import { EventDetails } from "@/components/admin/events/event-details";
import { PendingRequestBadge } from "@/components/association/events/association-event-columns";
import {
  DetailsToggle,
  gridCardDetailPanelClassName,
} from "@/components/common/detail-list";
import { InitialsAvatar } from "@/components/common/initials-avatar";
import { GridCard } from "@/components/data-table/grid-card";
import { Button } from "@/components/ui/button";
import { type AdminEvent, getEventTiming } from "@/hooks/use-admin-events";
import type { AdminRequest } from "@/hooks/use-admin-requests";
import { getInitials } from "@/lib/utils";

export interface AssociationEventGridCardProps {
  event: AdminEvent;
  pendingRequest?: AdminRequest;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onRequestChanges: (event: AdminEvent) => void;
  onRequestDeletion: (event: AdminEvent) => void;
}

export function AssociationEventGridCard({
  event,
  pendingRequest,
  isExpanded = false,
  onExpandedChange,
  onRequestChanges,
  onRequestDeletion,
}: AssociationEventGridCardProps) {
  return (
    <GridCard
      avatar={
        <InitialsAvatar initials={getInitials(event.name, "E")} size="md" />
      }
      title={event.name}
      badge={
        <div className="flex flex-wrap gap-1">
          <EventTimingBadge timing={getEventTiming(event)} />
          {pendingRequest && <PendingRequestBadge request={pendingRequest} />}
        </div>
      }
      actions={
        pendingRequest ? (
          <p className="text-xs text-muted-foreground">
            A request for this event is waiting for approval.
          </p>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex-1 text-xs"
              onClick={() => onRequestChanges(event)}
            >
              <Edit2 className="size-3 mr-1.5" />
              Request changes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex-1 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50/10"
              onClick={() => onRequestDeletion(event)}
            >
              <Trash2 className="size-3 mr-1.5" />
              Request deletion
            </Button>
          </>
        )
      }
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
