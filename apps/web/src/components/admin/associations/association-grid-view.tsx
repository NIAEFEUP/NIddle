import type { Table } from "@tanstack/react-table";
import { AdminGridView } from "@/components/admin/admin-grid-view";
import { AssociationGridCard } from "@/components/admin/associations/association-grid-card";
import type { Association } from "@/hooks/use-auth";

export interface AssociationGridViewProps {
  table: Table<Association>;
  onEdit: (association: Association) => void;
  onDelete: (association: Association) => void;
}

export function AssociationGridView({
  table,
  onEdit,
  onDelete,
}: AssociationGridViewProps) {
  return (
    <AdminGridView
      table={table}
      renderCard={(association, { isSelected, onSelectChange }) => (
        <AssociationGridCard
          association={association}
          isSelected={isSelected}
          onSelectChange={onSelectChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
}
