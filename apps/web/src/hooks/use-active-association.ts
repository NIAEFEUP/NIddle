import { useParams } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export function useActiveAssociation() {
  const { associationUUID } = useParams<{ associationUUID: string }>();
  const { user } = useAuth();

  if (!user || !user.associations) {
    return null;
  }

  return (
    user.associations.find(
      (assoc) => assoc.id.toString() === associationUUID,
    ) || null
  );
}
