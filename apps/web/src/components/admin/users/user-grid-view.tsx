import type { Table } from "@tanstack/react-table";
import { AdminGridView } from "@/components/admin/admin-grid-view";
import { UserGridCard } from "@/components/admin/users/user-grid-card";
import type { User } from "@/hooks/use-auth";

export interface UserGridViewProps {
  table: Table<User>;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserGridView({ table, onEdit, onDelete }: UserGridViewProps) {
  return (
    <AdminGridView
      table={table}
      renderCard={(user, { isSelected, onSelectChange }) => (
        <UserGridCard
          user={user}
          isSelected={isSelected}
          onSelectChange={onSelectChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
}
