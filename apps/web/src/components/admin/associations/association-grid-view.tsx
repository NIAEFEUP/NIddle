import type { Table } from "@tanstack/react-table";
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
  const rows = table.getRowModel().rows;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {rows.map((row) => (
        <AssociationGridCard
          key={row.original.id}
          association={row.original}
          isSelected={row.getIsSelected()}
          onSelectChange={(selected) => row.toggleSelected(selected)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
