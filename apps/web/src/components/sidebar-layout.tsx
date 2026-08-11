import { Link, Outlet, useLocation } from "react-router";
import { Home, LayoutDashboard } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function SidebarLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Link to="/" className="font-bold text-primary text-lg">
              NIddle
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link to="/" />}
                    isActive={location.pathname === "/"}
                  >
                    <Home />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link to="/dashboard" />}
                    isActive={location.pathname === "/dashboard"}
                  >
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-2 text-muted-foreground text-xs font-mono text-center">
            Press{" "}
            <kbd className="px-1 py-0.5 bg-muted rounded border border-muted-foreground/20">
              d
            </kbd>{" "}
            to toggle dark mode
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2" />
          <div className="flex-1">
            <span className="font-semibold text-sm">
              {location.pathname === "/"
                ? "Home"
                : location.pathname === "/dashboard"
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
