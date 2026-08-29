import { Building, ChevronsUpDown, Search, Shield } from "lucide-react";
import * as React from "react";
import { useLocation, useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { cn, getInitials } from "@/lib/utils";

function useIsMac() {
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    const platform = (
      (navigator as unknown as { userAgentData?: { platform?: string } })
        .userAgentData?.platform ||
      navigator.platform ||
      navigator.userAgent ||
      ""
    ).toLowerCase();
    setIsMac(platform.includes("mac"));
  }, []);

  return isMac;
}

export function SidebarHeaderComponent() {
  const { isMobile } = useSidebar();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMac = useIsMac();

  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const associations = user?.associations || [];

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const isAdminPath = pathSegments[0] === "admin";

  const associationUUID =
    !isAdminPath && pathSegments[0] ? pathSegments[0] : null;
  const activeAssociation = associations.find(
    (assoc) => assoc.id.toString() === associationUUID,
  );

  React.useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey
      ) {
        if (event.key === "0" && user?.isAdmin) {
          event.preventDefault();
          navigate("/admin");
          setIsOpen(false);
          return;
        }

        if (associations.length <= 9) {
          const digit = parseInt(event.key, 10);
          if (!Number.isNaN(digit) && digit >= 1 && digit <= 9) {
            const targetAssociation = associations[digit - 1];
            if (targetAssociation) {
              event.preventDefault();
              navigate(`/${targetAssociation.id}`);
              setIsOpen(false);
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [associations, user?.isAdmin, navigate]);

  const filteredAssociations = React.useMemo(() => {
    if (!search.trim()) return associations;
    const query = search.toLowerCase().trim();
    return associations.filter(
      (assoc) =>
        assoc.name.toLowerCase().includes(query) ||
        assoc.acronym?.toLowerCase().includes(query),
    );
  }, [associations, search]);

  const hasAssociationShortcuts = associations.length <= 9;

  let headerTitle = "Select Option";
  let headerSubtitle = "Choose a workspace";
  let headerInitials = "??";

  if (isAdminPath) {
    headerTitle = "Admin Dashboard";
    headerSubtitle = "System Administration";
    headerInitials = "AD";
  } else if (activeAssociation) {
    headerTitle = activeAssociation.acronym || activeAssociation.name;
    headerSubtitle = activeAssociation.name;
    headerInitials = getInitials(
      activeAssociation.acronym || activeAssociation.name,
      "A",
    );
  } else if (associations.length > 0) {
    headerTitle = "Select Association";
    headerSubtitle = `${associations.length} available`;
    headerInitials = "SA";
  }

  const handleSelectAdmin = () => {
    navigate("/admin");
    setIsOpen(false);
  };

  const handleSelectAssociation = (id: number) => {
    navigate(`/${id}`);
    setIsOpen(false);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
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
                <ChevronsUpDown className="ml-auto size-4 opacity-50" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-72 min-w-64 p-2 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {user?.isAdmin && (
              <DropdownMenuGroup>
                <DropdownMenuLabel>Administration</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={handleSelectAdmin}
                  className={cn(
                    isAdminPath &&
                      "bg-accent text-accent-foreground font-medium",
                  )}
                >
                  <Avatar className="h-6 w-6 rounded-sm shrink-0 after:rounded-sm">
                    <AvatarFallback className="rounded-sm bg-primary/10 text-primary text-[10px] font-semibold">
                      <Shield className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium text-xs truncate">
                      Admin Dashboard
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      System Administration
                    </span>
                  </div>
                  <DropdownMenuShortcut>
                    {isMac ? "⌘0" : "Ctrl+0"}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </DropdownMenuGroup>
            )}

            <DropdownMenuGroup>
              <div className="flex items-center justify-between px-1.5 py-1">
                <DropdownMenuLabel className="p-0">
                  Associations
                </DropdownMenuLabel>
                {associations.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {associations.length} available
                  </span>
                )}
              </div>

              {associations.length > 0 ? (
                <>
                  <div className="p-1 pb-1.5">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Search associations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="h-8 pl-8 pr-2 text-xs"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-0.5 mt-0.5">
                    {filteredAssociations.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No associations found
                      </div>
                    ) : (
                      filteredAssociations.map((association) => {
                        const originalIndex = associations.findIndex(
                          (a) => a.id === association.id,
                        );
                        const shortcutKey =
                          hasAssociationShortcuts &&
                          originalIndex >= 0 &&
                          originalIndex < 9
                            ? originalIndex + 1
                            : null;
                        const isActive =
                          activeAssociation?.id === association.id;
                        const displayTitle =
                          association.acronym || association.name;
                        return (
                          <DropdownMenuItem
                            key={association.id}
                            onClick={() =>
                              handleSelectAssociation(association.id)
                            }
                            className={cn(
                              isActive &&
                                "bg-accent text-accent-foreground font-medium",
                            )}
                          >
                            <Avatar className="h-6 w-6 rounded-sm shrink-0 after:rounded-sm">
                              <AvatarFallback className="rounded-sm bg-primary/10 text-primary text-[10px] font-semibold">
                                {getInitials(displayTitle, "A")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 min-w-0 pr-2">
                              <span className="font-medium text-xs truncate">
                                {displayTitle}
                              </span>
                              {association.acronym &&
                                association.name &&
                                association.acronym !== association.name && (
                                  <span className="text-[10px] text-muted-foreground truncate">
                                    {association.name}
                                  </span>
                                )}
                            </div>
                            {shortcutKey !== null && (
                              <DropdownMenuShortcut>
                                {isMac
                                  ? `⌘${shortcutKey}`
                                  : `Ctrl+${shortcutKey}`}
                              </DropdownMenuShortcut>
                            )}
                          </DropdownMenuItem>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  No associations available
                </div>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
