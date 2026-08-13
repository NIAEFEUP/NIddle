import { Outlet } from "react-router";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2" />
          <div className="flex-1">
            <span className="font-semibold text-sm">
              {currentPath === "/"
                ? "Home"
                : currentPath === "/dashboard"
                  ? "Dashboard"
                  : "Not Found"}
            </span>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
