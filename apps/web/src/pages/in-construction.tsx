import { Link } from "react-router";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export function InConstructionPage() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Page In Construction</CardTitle>
            <CardDescription>
              The page you are looking for is currently under construction.
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

export default InConstructionPage;
