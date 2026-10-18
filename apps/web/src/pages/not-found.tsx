import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardAction>
              <Badge variant="destructive">404</Badge>
            </CardAction>
            <CardTitle>Page Not Found</CardTitle>
            <CardDescription>
              The page you are looking for does not exist.
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

export default NotFoundPage;
