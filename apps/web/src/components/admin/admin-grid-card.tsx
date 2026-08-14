import { Edit2, Trash2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface AdminGridCardProps {
  avatar?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  children?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function AdminGridCard({
  avatar,
  title,
  subtitle,
  badge,
  isSelected = false,
  onSelectChange,
  children,
  onEdit,
  onDelete,
  actions,
  className,
}: AdminGridCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between rounded-xl border bg-card p-4 shadow-xs",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {avatar}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
            {badge && <div className="mt-0.5">{badge}</div>}
          </div>
        </div>
        {onSelectChange && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(value) => onSelectChange(!!value)}
            aria-label="Select card"
          />
        )}
      </div>

      {children && (
        <div className="mt-4 flex flex-col gap-2 border-t pt-3 text-xs">
          {children}
        </div>
      )}

      <div className="mt-4 flex gap-2 border-t pt-3">
        {actions ?? (
          <>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 flex-1 text-xs"
                onClick={onEdit}
              >
                <Edit2 className="size-3 mr-1.5" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 flex-1 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50/10"
                onClick={onDelete}
              >
                <Trash2 className="size-3 mr-1.5" />
                Delete
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
