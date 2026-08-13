import { AssociationNotFound } from "@/components/association/not-found";
import { useActiveAssociation } from "@/hooks/use-active-association";
import InConstructionPage from "../in-construction";

export function AssociationHomePage() {
  const association = useActiveAssociation();

  if (!association) {
    return <AssociationNotFound />;
  }

  return (
    <InConstructionPage />
  );
}

export default AssociationHomePage;
