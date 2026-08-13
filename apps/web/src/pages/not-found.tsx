import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
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
          <CardFooter className="flex justify-center">
            <Link to="/" className="text-primary hover:underline">
              Go back to Home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default NotFoundPage;
