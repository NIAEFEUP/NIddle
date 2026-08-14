import { AdminDeleteDialog } from "@/components/admin/admin-delete-dialog";
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
    <AdminDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      entityName="Association"
      itemName={association?.name}
      itemDetails={
        association?.acronym ? ` (${association.acronym})` : undefined
      }
      isLoading={isLoading}
      onConfirm={onConfirm}
    />
  );
}
