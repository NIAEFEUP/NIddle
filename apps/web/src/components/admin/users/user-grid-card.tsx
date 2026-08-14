import { Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { User } from "@/hooks/use-auth";

export interface UserGridCardProps {
  user: User;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserGridCard({
  user,
  isSelected = false,
  onSelectChange,
  onEdit,
  onDelete,
}: UserGridCardProps) {
  const initials =
    user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";
  const userAssocs = user.associations || [];

  return (
    <div className="relative flex flex-col justify-between rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {initials}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {user.name}
            </h3>
            <p className="text-[11px] text-muted-foreground">{user.email}</p>
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
        <div className="flex justify-between">
          <span className="text-muted-foreground">Role:</span>
          <span className="font-medium">
            {user.isAdmin ? "Admin" : "Member"}
          </span>
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <span className="text-muted-foreground">Associations:</span>
          {user.isAdmin ? (
            <span className="text-muted-foreground italic text-[11px]">
              All Access
            </span>
          ) : userAssocs.length === 0 ? (
            <span className="text-muted-foreground italic text-[11px]">
              No associations
            </span>
          ) : (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {userAssocs.map((assoc) => (
                <Badge
                  key={assoc.id}
                  variant="outline"
                  className="text-[9px] px-1 py-0 h-4 bg-muted/30"
                >
                  {assoc.acronym || assoc.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex-1 text-xs"
          onClick={() => onEdit(user)}
        >
          <Edit2 className="size-3 mr-1.5" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex-1 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50/10"
          onClick={() => onDelete(user)}
        >
          <Trash2 className="size-3 mr-1.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}
