import {
  formatScheduleSummary,
  getServiceAssociationLabel,
  getServiceScopeLabel,
} from "@/components/admin/services/service-columns";
import { ServiceDetails } from "@/components/admin/services/service-details";
import {
  DetailsToggle,
  gridCardDetailPanelClassName,
} from "@/components/common/detail-list";
import { InitialsAvatar } from "@/components/common/initials-avatar";
import { GridCard } from "@/components/data-table/grid-card";
import type { AdminService } from "@/hooks/use-admin-services";
import { getInitials } from "@/lib/utils";

export interface ServiceGridCardProps {
  service: AdminService;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onEdit: (service: AdminService) => void;
  onDelete: (service: AdminService) => void;
}

export function ServiceGridCard({
  service,
  isSelected = false,
  onSelectChange,
  isExpanded = false,
  onExpandedChange,
  onEdit,
  onDelete,
}: ServiceGridCardProps) {
  return (
    <GridCard
      avatar={
        <InitialsAvatar initials={getInitials(service.name, "S")} size="md" />
      }
      title={service.name}
      subtitle={getServiceAssociationLabel(service) || undefined}
      isSelected={isSelected}
      onSelectChange={onSelectChange}
      onEdit={() => onEdit(service)}
      onDelete={() => onDelete(service)}
    >
      <div className="flex justify-between items-center gap-2">
        <span className="text-muted-foreground">Location:</span>
        <span className="font-medium text-foreground truncate">
          {service.location || "—"}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">
          {service.course ? "Course:" : "Faculty:"}
        </span>
        <span className="font-medium text-foreground">
          {getServiceScopeLabel(service) || "—"}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Schedule:</span>
        <span className="font-medium text-foreground">
          {formatScheduleSummary(service)}
        </span>
      </div>
      {onExpandedChange && (
        <>
          <DetailsToggle
            isExpanded={isExpanded}
            onExpandedChange={onExpandedChange}
          />
          {isExpanded && (
            <ServiceDetails
              service={service}
              className={gridCardDetailPanelClassName}
            />
          )}
        </>
      )}
    </GridCard>
  );
}
