import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { Association } from "@/hooks/use-auth";

export interface DeleteAssociationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  association: Association | null;
  isLoading: boolean;
  onConfirm: () => void;
}

export function DeleteAssociationDialog({
  open,
  onOpenChange,
  association,
  isLoading,
  onConfirm,
}: DeleteAssociationDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Association"
      description={
        <>
          Are you sure you want to delete association{" "}
          <span className="font-semibold text-foreground">
            {association?.name}
          </span>
          {association?.acronym ? ` (${association.acronym})` : ""}? This action
          is permanent.
        </>
      }
      confirmLabel="Delete Association"
      cancelLabel="Cancel"
      variant="destructive"
      isLoading={isLoading}
      loadingLabel="Deleting..."
      onConfirm={onConfirm}
    />
  );
}
