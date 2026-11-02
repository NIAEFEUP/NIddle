import * as React from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityName: string;
  itemName?: string | null;
  itemDetails?: React.ReactNode;
  isLoading: boolean;
  onConfirm: () => void;
}

export function DeleteDialog({
  open,
  onOpenChange,
  entityName,
  itemName,
  itemDetails,
  isLoading,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${entityName}`}
      description={
        <>
          Are you sure you want to delete {entityName.toLowerCase()}{" "}
          <span className="font-semibold text-foreground">{itemName}</span>
          {itemDetails}? This action is permanent.
        </>
      }
      confirmLabel={`Delete ${entityName}`}
      cancelLabel="Cancel"
      variant="destructive"
      isLoading={isLoading}
      loadingLabel="Deleting..."
      onConfirm={onConfirm}
    />
  );
}

export interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  entityLabel?: string;
  entityPluralLabel?: string;
  isLoading: boolean;
  onConfirm: () => void;
}

export function BulkDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  entityLabel = "item",
  entityPluralLabel,
  isLoading,
  onConfirm,
}: BulkDeleteDialogProps) {
  const plural = entityPluralLabel || `${entityLabel}s`;
  const countLabel = selectedCount === 1 ? entityLabel : plural;
  const countLabelCapitalized =
    countLabel.charAt(0).toUpperCase() + countLabel.slice(1);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${selectedCount} ${countLabelCapitalized}`}
      description={
        <>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">
            {selectedCount} selected {countLabel}
          </span>
          ? This action is permanent and cannot be undone.
        </>
      }
      confirmLabel={`Delete ${selectedCount} ${countLabelCapitalized}`}
      cancelLabel="Cancel"
      variant="destructive"
      isLoading={isLoading}
      loadingLabel="Deleting..."
      onConfirm={onConfirm}
    />
  );
}
