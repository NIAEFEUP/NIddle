import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router";

export function HomePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>You are logged in as {user.name}.</CardDescription>
          </CardHeader>
          <CardContent>
            {user.associations.length > 0 ? (
              <p>Get started by selecting an association on the sidebar.</p>
            ) : (
              <p>
                You do not have access to any associations. Contact NIAEFEUP for
                more information.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default HomePage;
