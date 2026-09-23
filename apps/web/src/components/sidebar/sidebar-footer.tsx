import {
  Check,
  ChevronsUpDown,
  Copy,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import * as React from "react";
import { Link, useNavigate } from "react-router";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "@/components/ui/toast";
import { type User as UserType, useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";

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

interface SidebarFooterProps {
  user?: UserType | null;
  isAuthenticated?: boolean;
  onLogout?: () => Promise<void>;
}

export function SidebarFooterComponent(props?: SidebarFooterProps) {
  const { isMobile } = useSidebar();
  const auth = useAuth();
  const navigate = useNavigate();
  const isMac = useIsMac();
  const { theme, setTheme } = useTheme();

  const [isOpen, setIsOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const user = props?.user !== undefined ? props.user : auth.user;
  const isAuthenticated =
    props?.isAuthenticated !== undefined
      ? props.isAuthenticated
      : auth.isAuthenticated;

  const handleLogout = React.useCallback(async () => {
    setIsOpen(false);
    if (props?.onLogout) {
      await props.onLogout();
    } else {
      await auth.logout();
      navigate("/login");
    }
  }, [props, auth, navigate]);

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.email) return;
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      toast.add({
        type: "success",
        title: "Email copied",
        description: "Email address copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.add({
        type: "error",
        title: "Failed to copy",
        description: "Could not copy email to clipboard.",
      });
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        !event.altKey &&
        (event.key.toLowerCase() === "q" || event.key === "Q")
      ) {
        if (isAuthenticated && user) {
          event.preventDefault();
          handleLogout();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthenticated, user, handleLogout]);

  if (!isAuthenticated || !user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            render={<Link to="/login" />}
            tooltip="Sign in"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8 rounded-lg after:rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
                <LogIn className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Sign in</span>
              <span className="truncate text-xs text-muted-foreground">
                Access your account
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const userInitials = getInitials(user.name, "U");

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
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
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
            <DropdownMenuGroup>
              <div className="flex items-center justify-between px-1.5 py-1">
                <DropdownMenuLabel className="p-0">Account</DropdownMenuLabel>
                {user.isAdmin && (
                  <span className="text-[10px] text-muted-foreground">
                    Administrator
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 py-1.5 px-2 rounded-md">
                <Avatar className="h-8 w-8 rounded-lg shrink-0 after:rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-xs truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleCopyEmail}
                  className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                  title={copied ? "Copied email!" : "Copy email"}
                  aria-label="Copy email"
                >
                  {copied ? (
                    <Check className="size-3 text-primary" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </Button>
              </div>
              <DropdownMenuSeparator />
            </DropdownMenuGroup>

            <DropdownMenuGroup>
              <DropdownMenuLabel>Preferences</DropdownMenuLabel>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Avatar className="h-6 w-6 rounded-sm shrink-0 after:rounded-sm">
                    <AvatarFallback className="rounded-sm bg-primary/10 text-primary text-[10px] font-semibold">
                      {theme === "light" ? (
                        <Sun className="h-3.5 w-3.5" />
                      ) : theme === "dark" ? (
                        <Moon className="h-3.5 w-3.5" />
                      ) : (
                        <Monitor className="h-3.5 w-3.5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-xs truncate">Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-40 p-1 rounded-lg">
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={(val) =>
                      setTheme(val as "light" | "dark" | "system")
                    }
                  >
                    <DropdownMenuRadioItem value="light">
                      <Avatar className="h-6 w-6 rounded-sm shrink-0 after:rounded-sm">
                        <AvatarFallback className="rounded-sm bg-primary/10 text-primary text-[10px] font-semibold">
                          <Sun className="h-3.5 w-3.5" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-xs">Light</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <Avatar className="h-6 w-6 rounded-sm shrink-0 after:rounded-sm">
                        <AvatarFallback className="rounded-sm bg-primary/10 text-primary text-[10px] font-semibold">
                          <Moon className="h-3.5 w-3.5" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-xs">Dark</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      <Avatar className="h-6 w-6 rounded-sm shrink-0 after:rounded-sm">
                        <AvatarFallback className="rounded-sm bg-primary/10 text-primary text-[10px] font-semibold">
                          <Monitor className="h-3.5 w-3.5" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-xs">System</span>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
            </DropdownMenuGroup>

            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <Avatar className="h-6 w-6 rounded-sm shrink-0 after:rounded-sm">
                  <AvatarFallback className="rounded-sm bg-destructive/10 text-destructive text-[10px] font-semibold">
                    <LogOut className="h-3.5 w-3.5" />
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-xs truncate">Log out</span>
                <DropdownMenuShortcut>
                  {isMac ? "⇧⌘Q" : "Ctrl+Shift+Q"}
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
