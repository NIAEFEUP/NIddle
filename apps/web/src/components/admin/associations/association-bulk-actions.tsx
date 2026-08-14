import { AdminBulkActions } from "@/components/admin/admin-bulk-actions";

export interface AssociationBulkActionsProps {
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function AssociationBulkActions({
  selectedCount,
  onExport,
  onDelete,
  onClear,
}: AssociationBulkActionsProps) {
  return (
    <AdminBulkActions
      selectedCount={selectedCount}
      entityLabel="association"
      entityPluralLabel="associations"
      onExport={onExport}
      onDelete={onDelete}
      onClear={onClear}
    />
  );
}
