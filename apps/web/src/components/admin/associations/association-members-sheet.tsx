import { Loader2, Search, Shield, UserMinus, UserPlus } from "lucide-react";
import * as React from "react";
import { InitialsAvatar } from "@/components/common/initials-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAssociationMembers } from "@/hooks/use-association-members";
import type { Association, User } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api-client";
import { getInitials } from "@/lib/utils";

export interface AssociationMembersSheetProps {
  association: Association | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function matchesQuery(user: User, query: string) {
  return (
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  );
}

interface MemberRowProps {
  user: User;
  isPending: boolean;
  disabled: boolean;
  action: "add" | "remove";
  onAction: (user: User) => void;
}

function MemberRow({
  user,
  isPending,
  disabled,
  action,
  onAction,
}: MemberRowProps) {
  return (
    <li className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent/50">
      <InitialsAvatar initials={getInitials(user.name, "U")} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1.5 truncate text-xs font-medium text-foreground">
          {user.name}
          {user.isAdmin && (
            <Shield
              className="size-3 shrink-0 text-muted-foreground"
              aria-label="Administrator"
            />
          )}
        </span>
        <span className="truncate text-[11px] text-muted-foreground">
          {user.email}
        </span>
      </div>
      {action === "add" ? (
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => onAction(user)}
          disabled={disabled}
          aria-label={`Add ${user.name}`}
        >
          {isPending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <UserPlus className="size-3" />
          )}
          Add
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50/10"
          onClick={() => onAction(user)}
          disabled={disabled}
          aria-label={`Remove ${user.name}`}
        >
          {isPending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <UserMinus className="size-3" />
          )}
          Remove
        </Button>
      )}
    </li>
  );
}

export function AssociationMembersSheet({
  association,
  open,
  onOpenChange,
}: AssociationMembersSheetProps) {
  const {
    members,
    nonMembers,
    isLoading,
    isError,
    error,
    addMember,
    removeMember,
    pendingUserId,
  } = useAssociationMembers(open && association ? association.id : null);

  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const query = search.toLowerCase().trim();
  const filteredMembers = query
    ? members.filter((user) => matchesQuery(user, query))
    : members;
  const candidates = query
    ? nonMembers.filter((user) => matchesQuery(user, query))
    : [];
  const isBusy = pendingUserId !== undefined;
  const title = association?.acronym || association?.name || "Association";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>{title} Members</SheetTitle>
          <SheetDescription>
            {association?.acronym && association.name !== association.acronym
              ? `${association.name} · `
              : ""}
            {members.length} {members.length === 1 ? "member" : "members"}
          </SheetDescription>
        </SheetHeader>

        <div className="border-b p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search members or find users to add..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading members...
            </div>
          ) : isError ? (
            <div className="py-10 text-center text-xs text-destructive">
              {getErrorMessage(error)}
            </div>
          ) : (
            <>
              {query && (
                <section className="mb-3">
                  <h3 className="px-2 py-1.5 text-[11px] font-semibold uppercase text-muted-foreground">
                    Add users
                  </h3>
                  {candidates.length === 0 ? (
                    <p className="px-2 py-3 text-xs text-muted-foreground">
                      No other users match "{search.trim()}".
                    </p>
                  ) : (
                    <ul className="space-y-0.5">
                      {candidates.map((user) => (
                        <MemberRow
                          key={user.id}
                          user={user}
                          action="add"
                          isPending={pendingUserId === user.id}
                          disabled={isBusy}
                          onAction={addMember}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              )}

              <section>
                <h3 className="px-2 py-1.5 text-[11px] font-semibold uppercase text-muted-foreground">
                  {query ? "Matching members" : "Members"}
                </h3>
                {filteredMembers.length === 0 ? (
                  <p className="px-2 py-3 text-xs text-muted-foreground">
                    {query
                      ? "No members match your search."
                      : "This association has no members yet. Search above to add users."}
                  </p>
                ) : (
                  <ul className="space-y-0.5">
                    {filteredMembers.map((user) => (
                      <MemberRow
                        key={user.id}
                        user={user}
                        action="remove"
                        isPending={pendingUserId === user.id}
                        disabled={isBusy}
                        onAction={removeMember}
                      />
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
