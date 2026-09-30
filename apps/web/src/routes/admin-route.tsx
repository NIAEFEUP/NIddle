import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export function AdminRoute() {
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
