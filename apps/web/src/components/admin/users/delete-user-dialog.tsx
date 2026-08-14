import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { User } from "@/hooks/use-auth";

export interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  isLoading: boolean;
  onConfirm: () => void;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
  isLoading,
  onConfirm,
}: DeleteUserDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete User"
      description={
        <>
          Are you sure you want to delete user{" "}
          <span className="font-semibold text-foreground">{user?.name}</span>?
          This action is permanent.
        </>
      }
      confirmLabel="Delete User"
      cancelLabel="Cancel"
      variant="destructive"
      isLoading={isLoading}
      loadingLabel="Deleting..."
      onConfirm={onConfirm}
    />
  );
}
