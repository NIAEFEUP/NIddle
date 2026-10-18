import { useLocation, useNavigate } from "react-router";
import { SidebarLayout as VisualSidebarLayout } from "@/components/layout/sidebar-layout";
import { useAuth } from "@/hooks/use-auth";

export function SidebarLayoutRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <VisualSidebarLayout
      user={user}
      onLogout={handleLogout}
      currentPath={location.pathname}
    />
  );
}
