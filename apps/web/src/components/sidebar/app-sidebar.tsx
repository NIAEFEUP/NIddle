import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import type { User as UserType } from "@/hooks/use-auth";
import { SidebarContentComponent } from "./sidebar-content";
import { SidebarFooterComponent } from "./sidebar-footer";
import { SidebarHeaderComponent } from "./sidebar-header";

interface AppSidebarProps {
  user: UserType | null;
  isAuthenticated: boolean;
  onLogout: () => Promise<void>;
  currentPath: string;
}

export function AppSidebar({
  user,
  isAuthenticated,
  onLogout,
  currentPath,
}: AppSidebarProps) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarHeaderComponent />
      </SidebarHeader>
      <SidebarContent>
        <SidebarContentComponent currentPath={currentPath} />
      </SidebarContent>
      <SidebarFooter className="border-t border-border/60">
        <SidebarFooterComponent
          user={user}
          isAuthenticated={isAuthenticated}
          onLogout={onLogout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
