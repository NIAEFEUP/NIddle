import { AdminAvatar } from "@/components/admin/admin-avatar";
import { AdminGridCard } from "@/components/admin/admin-grid-card";
import type { User } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";

export interface UserGridCardProps {
  user: User;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserGridCard({
  user,
  isSelected = false,
  onSelectChange,
  onEdit,
  onDelete,
}: UserGridCardProps) {
  const initials = getInitials(user.name, "U");
  const userAssocs = user.associations || [];

  return (
    <AdminGridCard
      avatar={<AdminAvatar initials={initials} size="md" />}
      title={user.name}
      subtitle={user.email}
      isSelected={isSelected}
      onSelectChange={onSelectChange}
      onEdit={() => onEdit(user)}
      onDelete={() => onDelete(user)}
    >
      <div className="flex justify-between">
        <span className="text-muted-foreground">Role:</span>
        <span className="font-medium">{user.isAdmin ? "Admin" : "User"}</span>
      </div>
      <div className="flex justify-between gap-1 mt-1">
        <span className="text-muted-foreground">Associations:</span>
        {user.isAdmin ? (
          <span className="text-xs font-medium text-foreground">
            All Access
          </span>
        ) : userAssocs.length === 0 ? (
          <span className="text-xs font-medium text-foreground">None</span>
        ) : (
          <div>
            {userAssocs.map((assoc, index) => (
              <span
                key={assoc.id}
                className="text-xs font-medium text-foreground"
              >
                {assoc.acronym || assoc.name}
                {index < userAssocs.length - 1 && ", "}
              </span>
            ))}
          </div>
        )}
      </div>
    </AdminGridCard>
  );
}
