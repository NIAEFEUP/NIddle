import { AdminDeleteDialog } from "@/components/admin/admin-delete-dialog";
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
    <AdminDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      entityName="User"
      itemName={user?.name}
      isLoading={isLoading}
      onConfirm={onConfirm}
    />
  );
}
