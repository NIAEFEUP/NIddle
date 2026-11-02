import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface RejectReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  itemTitle?: string;
  count?: number;
  isLoading?: boolean;
  onConfirm: (reason: string) => void;
}

export function RejectReasonDialog({
  open,
  onOpenChange,
  title,
  itemTitle,
  count,
  isLoading = false,
  onConfirm,
}: RejectReasonDialogProps) {
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setReason("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for the rejection.");
      return;
    }
    setError(null);
    onConfirm(reason.trim());
  };

  const dialogTitle =
    title ||
    (count && count > 1
      ? `Reject ${count} Requests`
      : `Reject Request${itemTitle ? `: ${itemTitle}` : ""}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              Please state why this request cannot be approved. The reason will
              be saved and made visible to the requesting association.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <label
              htmlFor="rejection-reason"
              className="text-xs font-medium text-foreground block"
            >
              Rejection Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              id="rejection-reason"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Missing required room reservation details, or dates conflict with exam period..."
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <p className="text-[11px] font-medium text-destructive">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading || !reason.trim()}
            >
              {isLoading ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
