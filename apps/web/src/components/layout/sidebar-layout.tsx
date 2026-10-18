import { Outlet } from "react-router";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { User as UserType } from "@/hooks/use-auth";

interface SidebarLayoutProps {
  user: UserType | null;
  onLogout: () => Promise<void>;
  currentPath: string;
}

export function SidebarLayout({
  user,
  onLogout,
  currentPath,
}: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} onLogout={onLogout} currentPath={currentPath} />
      <SidebarInset>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
