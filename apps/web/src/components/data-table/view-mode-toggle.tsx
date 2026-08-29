import { Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "list" | "grid";

export interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  listLabel?: string;
  gridLabel?: string;
}

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
  listLabel = "List View",
  gridLabel = "Grid View",
}: ViewModeToggleProps) {
  return (
    <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
      <Button
        variant={viewMode === "list" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 gap-1.5 px-3 text-xs"
        onClick={() => onViewModeChange("list")}
      >
        <List className="size-3.5" />
        {listLabel}
      </Button>
      <Button
        variant={viewMode === "grid" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 gap-1.5 px-3 text-xs"
        onClick={() => onViewModeChange("grid")}
      >
        <Grid className="size-3.5" />
        {gridLabel}
      </Button>
    </div>
  );
}
