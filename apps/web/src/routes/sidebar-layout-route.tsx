import { useLocation, useNavigate } from "react-router";
import { SidebarLayout as VisualSidebarLayout } from "@/components/layout/sidebar-layout";
import { useAuth } from "@/hooks/use-auth";

export function SidebarLayoutRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <VisualSidebarLayout
      user={user}
      isAuthenticated={isAuthenticated}
      onLogout={handleLogout}
      currentPath={location.pathname}
    />
  );
}
