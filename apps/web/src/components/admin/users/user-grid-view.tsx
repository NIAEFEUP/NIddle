import type { Table } from "@tanstack/react-table";
import { UserGridCard } from "@/components/admin/users/user-grid-card";
import type { User } from "@/hooks/use-auth";

export interface UserGridViewProps {
  table: Table<User>;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserGridView({
  table,
  onEdit,
  onDelete,
}: UserGridViewProps) {
  const rows = table.getRowModel().rows;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {rows.map((row) => (
        <UserGridCard
          key={row.original.id}
          user={row.original}
          isSelected={row.getIsSelected()}
          onSelectChange={(selected) => row.toggleSelected(selected)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
