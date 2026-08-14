import { Outlet } from "react-router";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { User as UserType } from "@/hooks/use-auth";

interface SidebarLayoutProps {
  user: UserType | null;
  isAuthenticated: boolean;
  onLogout: () => Promise<void>;
  currentPath: string;
}

export function SidebarLayout({
  user,
  isAuthenticated,
  onLogout,
  currentPath,
}: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
        currentPath={currentPath}
      />
      <SidebarInset>
        <main className="flex-1 px-6 py-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
