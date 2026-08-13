import { LogIn, LogOut, User } from "lucide-react";
import { Link } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import type { User as UserType } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface SidebarFooterProps {
  user: UserType | null;
  isAuthenticated: boolean;
  onLogout: () => Promise<void>;
}

export function SidebarFooterComponent({
  user,
  isAuthenticated,
  onLogout,
}: SidebarFooterProps) {
  return (
    <>
      {isAuthenticated && user ? (
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center gap-2 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
              <span className="truncate font-semibold text-foreground">
                {user.name}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start gap-2 h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs font-medium">Log out</span>
          </Button>
        </div>
      ) : (
        <Link
          to="/login"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full justify-start gap-2 h-8 px-2 cursor-pointer text-foreground hover:no-underline",
          )}
        >
          <LogIn className="h-4 w-4" />
          <span className="text-xs font-medium">Sign in</span>
        </Link>
      )}
    </>
  );
}
