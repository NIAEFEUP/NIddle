import { Edit2, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Association } from "@/hooks/use-auth";

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
  const initials = (
    association.acronym ||
    association.name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("") ||
    "A"
  )
    .slice(0, 2)
    .toUpperCase();

  const memberCount = association.users?.length ?? 0;

  return (
    <div className="relative flex flex-col justify-between rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary aspect-square">
            {initials}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {association.name}
            </h3>
            {association.acronym && (
              <span className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground mt-0.5">
                {association.acronym}
              </span>
            )}
          </div>
        </div>
        {onSelectChange && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(value) => onSelectChange(!!value)}
          />
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t pt-3 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Members:</span>
          <div className="flex items-center gap-1 font-medium text-foreground">
            <Users className="size-3 text-muted-foreground" />
            <span>
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex-1 text-xs"
          onClick={() => onEdit(association)}
        >
          <Edit2 className="size-3 mr-1.5" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex-1 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50/10"
          onClick={() => onDelete(association)}
        >
          <Trash2 className="size-3 mr-1.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}
