import { AdminBulkActions } from "@/components/admin/admin-bulk-actions";

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
  return (
    <AdminBulkActions
      selectedCount={selectedCount}
      entityLabel="user"
      entityPluralLabel="users"
      onExport={onExport}
      onDelete={onDelete}
      onClear={onClear}
    />
  );
}
