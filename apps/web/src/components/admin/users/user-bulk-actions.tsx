import { Download, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UserBulkActionsProps {
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function UserBulkActions({
  selectedCount,
  onExport,
  onDelete,
  onClear,
}: UserBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <section
      aria-label="Bulk actions"
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-2 rounded-full border bg-card/95 px-4 py-2 shadow-xl backdrop-blur-md transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-4"
    >
      <div className="flex items-center gap-1 pr-2 border-r border-border text-xs font-medium text-foreground">
        {selectedCount}
        <span className="whitespace-nowrap">
          {selectedCount === 1 ? "member" : "members"} selected
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs font-normal border-input hover:bg-muted"
        onClick={onExport}
      >
        <Download className="size-3.5" />
        Export CSV
      </Button>

      <Button
        variant="destructive"
        size="sm"
        className="h-8 gap-1.5 text-xs font-medium"
        onClick={onDelete}
      >
        <Trash2 className="size-3.5" />
        Delete
      </Button>

      <Button
        variant="ghost"
        size="icon-xs"
        className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-full"
        onClick={onClear}
        title="Clear selection"
      >
        <X className="size-3.5" />
        <span className="sr-only">Clear selection</span>
      </Button>
    </section>
  );
}
