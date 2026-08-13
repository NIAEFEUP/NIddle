import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AssociationNotFound() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Association Not Found</CardTitle>
            <CardDescription>
              The association you are trying to access does not exist or you do
              not have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="flex flex-wrap w-full justify-between">
              <div className="flex gap-2">
                <Link
                  to="/"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                  )}
                >
                  <ArrowLeft className="mr-1" />
                  Back
                </Link>
              </div>
              <a
                href="mailto:niaefeup@fe.up.pt"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-muted-foreground hover:text-foreground",
                )}
              >
                Contact NIAEFEUP
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default AssociationNotFound;
