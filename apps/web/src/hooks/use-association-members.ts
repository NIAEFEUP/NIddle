import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "@/components/ui/toast";
import type { User } from "@/hooks/use-auth";
import { apiClient, fetchAllPages, getErrorMessage } from "@/lib/api-client";

interface MembershipChange {
  user: User;
  associationId: string;
  isMember: boolean;
}

export function useAssociationMembers(associationId: string | null) {
  const queryClient = useQueryClient();

  const usersQuery = useQuery<User[], Error>({
    queryKey: ["admin-users-list"],
    queryFn: () => fetchAllPages<User>("/api/users"),
    enabled: associationId !== null,
  });

  const { members, nonMembers } = React.useMemo(() => {
    const users = usersQuery.data ?? [];
    const isMember = (user: User) =>
      (user.associations ?? []).some((a) => a.id === associationId);
    return {
      members: users.filter(isMember),
      nonMembers: users.filter((user) => !isMember(user)),
    };
  }, [usersQuery.data, associationId]);

  // The API has no membership endpoints: PATCH /users/:id replaces the user's
  // whole associationIds list, so we send their current list plus/minus this one.
  const membershipMutation = useMutation({
    mutationFn: ({ user, associationId, isMember }: MembershipChange) => {
      const currentIds = (user.associations ?? []).map((a) => a.id);
      const associationIds = isMember
        ? [...new Set([...currentIds, associationId])]
        : currentIds.filter((id) => id !== associationId);
      return apiClient<User>(`/api/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ associationIds }),
      });
    },
    onSuccess: (_data, { user, isMember }) => {
      toast.add({
        type: "success",
        title: isMember ? "Member added" : "Member removed",
        description: isMember
          ? `${user.name} was added to the association.`
          : `${user.name} was removed from the association.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-associations-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-associations-all"] });
    },
    onError: (err) => {
      toast.add({
        type: "error",
        title: "Membership update failed",
        description: getErrorMessage(err),
      });
    },
  });

  const addMember = (user: User) => {
    if (!associationId) return;
    membershipMutation.mutate({ user, associationId, isMember: true });
  };

  const removeMember = (user: User) => {
    if (!associationId) return;
    membershipMutation.mutate({ user, associationId, isMember: false });
  };

  const pendingUserId = membershipMutation.isPending
    ? membershipMutation.variables?.user.id
    : undefined;

  return {
    members,
    nonMembers,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    addMember,
    removeMember,
    pendingUserId,
  };
}
