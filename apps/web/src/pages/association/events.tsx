import { AssociationNotFound } from "@/components/association/not-found";
import { useActiveAssociation } from "@/hooks/use-active-association";
import InConstructionPage from "@/pages/in-construction";

export function AssociationEventsPage() {
  const association = useActiveAssociation();

  if (!association) {
    return <AssociationNotFound />;
  }

  return <InConstructionPage />;
}

export default AssociationEventsPage;
