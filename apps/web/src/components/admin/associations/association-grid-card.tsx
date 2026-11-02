import { Users } from "lucide-react";
import { InitialsAvatar } from "@/components/common/initials-avatar";
import { GridCard } from "@/components/data-table/grid-card";
import type { Association } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";

export interface AssociationGridCardProps {
  association: Association;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onEdit: (association: Association) => void;
  onDelete: (association: Association) => void;
}

export function AssociationGridCard({
  association,
  isSelected = false,
  onSelectChange,
  onEdit,
  onDelete,
}: AssociationGridCardProps) {
  const initials = getInitials(association.acronym || association.name, "A");
  const memberCount = association.users?.length ?? 0;

  return (
    <GridCard
      avatar={<InitialsAvatar initials={initials} size="md" />}
      title={association.name}
      subtitle={association.acronym}
      isSelected={isSelected}
      onSelectChange={onSelectChange}
      onEdit={() => onEdit(association)}
      onDelete={() => onDelete(association)}
    >
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Members:</span>
        <div className="flex items-center gap-1 font-medium text-foreground">
          <Users className="size-3 text-muted-foreground" />
          <span>
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>
      </div>
    </GridCard>
  );
}
