import { Building, ChevronsUpDown, Shield } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

export function SidebarHeaderComponent() {
  const { isMobile } = useSidebar();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const associations = user?.associations || [];

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const isAdminPath = pathSegments[0] === "admin";

  const associationUUID =
    !isAdminPath && pathSegments[0] ? pathSegments[0] : null;
  const activeAssociation = associations.find(
    (assoc) => assoc.id.toString() === associationUUID,
  );

  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "T"
    );
  };

  let headerTitle = "Select Option";
  let headerSubtitle = "Choose a workspace";
  let headerInitials = "??";

  if (isAdminPath) {
    headerTitle = "Admin Dashboard";
    headerSubtitle = "";
    headerInitials = "AD";
  } else if (activeAssociation) {
    headerTitle = activeAssociation.acronym || activeAssociation.name;
    headerSubtitle = activeAssociation.name;
    headerInitials = getInitials(
      activeAssociation.acronym || activeAssociation.name,
    );
  } else if (associations.length > 0) {
    headerTitle = "Select Association";
    headerSubtitle = `${associations.length} available`;
    headerInitials = "SA";
  }

  const handleSelectAdmin = () => {
    navigate("/admin");
  };

  const handleSelectAssociation = (id: number) => {
    navigate(`/${id}`);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg after:rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
                    {isAdminPath ? (
                      <Shield className="h-4 w-4" />
                    ) : headerInitials === "??" || headerInitials === "SA" ? (
                      <Building className="h-4 w-4" />
                    ) : (
                      headerInitials
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{headerTitle}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {headerSubtitle}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {user?.isAdmin && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Administration
                </div>
                <DropdownMenuItem
                  onClick={handleSelectAdmin}
                  className="gap-2 p-2 cursor-pointer"
                >
                  <Avatar className="h-6 w-6 rounded-sm after:rounded-sm">
                    <AvatarFallback className="rounded-sm bg-primary/10 text-primary text-xs font-semibold">
                      <Shield className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">Admin Dashboard</span>
                </DropdownMenuItem>
                {associations.length > 0 && (
                  <div className="h-px bg-muted my-1" />
                )}
              </>
            )}

            {associations.length > 0 ? (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Associations
                </div>
                {associations.map((association, index) => (
                  <DropdownMenuItem
                    key={association.id}
                    onClick={() => handleSelectAssociation(association.id)}
                    className="gap-2 p-2 cursor-pointer"
                  >
                    <Avatar className="h-6 w-6 rounded-sm after:rounded-sm">
                      <AvatarFallback className="rounded-sm bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(association.acronym || association.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">
                      {association.acronym || association.name}
                    </span>
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
              </>
            ) : (
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                No associations available
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
