import { Download, Trash2, X } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface BulkActionsProps {
  selectedCount: number;
  entityLabel?: string;
  entityPluralLabel?: string;
  onExport?: () => void;
  onDelete?: () => void;
  onClear?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function BulkActions({
  selectedCount,
  entityLabel = "item",
  entityPluralLabel,
  onExport,
  onDelete,
  onClear,
  children,
  className,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  const plural = entityPluralLabel || `${entityLabel}s`;
  const label = selectedCount === 1 ? entityLabel : plural;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-lg border bg-card p-1 text-card-foreground shadow-sm duration-150 ease-out animate-in fade-in-0 slide-in-from-bottom-2",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-2 text-xs font-medium text-muted-foreground">
        <Badge variant="secondary" className="tabular-nums">
          {selectedCount}
        </Badge>
        <span>{label} selected</span>
      </div>

      <Separator orientation="vertical" />

      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download />
          Export CSV
        </Button>
      )}

      {children}

      {onDelete && (
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 />
          Delete
        </Button>
      )}

      {onClear && (
        <>
          <Separator orientation="vertical" />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClear}
                  aria-label="Clear selection"
                >
                  <X />
                </Button>
              }
            />
            <TooltipContent side="top">Clear selection</TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  );
}
