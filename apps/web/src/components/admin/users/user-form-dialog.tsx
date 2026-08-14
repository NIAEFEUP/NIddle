import { ChevronsUpDown, Search } from "lucide-react";
import * as React from "react";
import { FormDialog } from "@/components/common/form-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserFormData } from "@/hooks/use-admin-users";
import type { Association, User } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";

export interface UserFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  associations: Association[];
  isLoading: boolean;
  onSubmit: (formData: UserFormData) => void;
}

function sortAssociationsWithSelectedFirst(
  items: Association[],
  selectedIds: number[],
) {
  const selectedSet = new Set(selectedIds);
  const selected = items.filter((assoc) => selectedSet.has(assoc.id));
  const unselected = items.filter((assoc) => !selectedSet.has(assoc.id));
  return [...selected, ...unselected];
}

export function UserFormDialog({
  mode,
  open,
  onOpenChange,
  user,
  associations,
  isLoading,
  onSubmit,
}: UserFormDialogProps) {
  const isEdit = mode === "edit";

  const [formData, setFormData] = React.useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    isAdmin: false,
    associationIds: [],
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
    {},
  );
  const [associationSearch, setAssociationSearch] = React.useState("");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [orderedAssociations, setOrderedAssociations] = React.useState<
    Association[]
  >(() =>
    sortAssociationsWithSelectedFirst(associations, formData.associationIds),
  );

  React.useEffect(() => {
    if (open) {
      if (isEdit && user) {
        setFormData({
          name: user.name,
          email: user.email,
          password: "",
          isAdmin: user.isAdmin,
          associationIds: user.associations?.map((a) => a.id) || [],
        });
      } else {
        setFormData({
          name: "",
          email: "",
          password: "",
          isAdmin: false,
          associationIds: [],
        });
      }
      setFormErrors({});
      setAssociationSearch("");
      setIsDropdownOpen(false);
    }
  }, [open, isEdit, user]);

  React.useEffect(() => {
    if (!isDropdownOpen) {
      setOrderedAssociations(
        sortAssociationsWithSelectedFirst(
          associations,
          formData.associationIds,
        ),
      );
    }
  }, [isDropdownOpen, associations, formData.associationIds]);

  const handleDropdownOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOrderedAssociations(
        sortAssociationsWithSelectedFirst(
          associations,
          formData.associationIds,
        ),
      );
    }
    setIsDropdownOpen(nextOpen);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 5) {
      errors.name = "Name must be at least 5 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = "Please provide a valid email address.";
    }

    if (!isEdit) {
      if (!formData.password) {
        errors.password = "Password is required.";
      } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
      } else {
        const hasLower = /[a-z]/.test(formData.password);
        const hasUpper = /[A-Z]/.test(formData.password);
        const hasNumber = /\d/.test(formData.password);
        const hasSymbol = /[^a-zA-Z0-9]/.test(formData.password);
        if (!hasLower || !hasUpper || !hasNumber || !hasSymbol) {
          errors.password =
            "Must contain 1 uppercase, 1 lowercase, 1 digit, and 1 symbol.";
        }
      }
    } else if (formData.password) {
      if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
      } else {
        const hasLower = /[a-z]/.test(formData.password);
        const hasUpper = /[A-Z]/.test(formData.password);
        const hasNumber = /\d/.test(formData.password);
        const hasSymbol = /[^a-zA-Z0-9]/.test(formData.password);
        if (!hasLower || !hasUpper || !hasNumber || !hasSymbol) {
          errors.password =
            "Must contain 1 uppercase, 1 lowercase, 1 digit, and 1 symbol.";
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData);
  };

  const toggleAssociation = (id: number) => {
    setFormData((prev) => {
      const activeIds = prev.associationIds.includes(id)
        ? prev.associationIds.filter((aid) => aid !== id)
        : [...prev.associationIds, id];
      return { ...prev, associationIds: activeIds };
    });
  };

  const clearAllAssociations = () => {
    setFormData((prev) => ({ ...prev, associationIds: [] }));
  };

  const filteredAssociations = React.useMemo(() => {
    if (!associationSearch.trim()) return orderedAssociations;
    const query = associationSearch.toLowerCase().trim();
    return orderedAssociations.filter(
      (assoc) =>
        assoc.name.toLowerCase().includes(query) ||
        assoc.acronym?.toLowerCase().includes(query),
    );
  }, [orderedAssociations, associationSearch]);

  const selectedAssociations = React.useMemo(() => {
    return associations.filter((assoc) =>
      formData.associationIds.includes(assoc.id),
    );
  }, [associations, formData.associationIds]);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit User" : "Create User"}
      description={
        isEdit
          ? "Modify user details and permissions."
          : "Add a new user access credentials and configuration."
      }
      isEdit={isEdit}
      isLoading={isLoading}
      submitLabel={isEdit ? "Save Changes" : "Create User"}
      onSubmit={handleSubmit}
    >
      <Field data-invalid={!!formErrors.name}>
        <FieldLabel htmlFor="user-name">Full Name</FieldLabel>
        <Input
          id="user-name"
          placeholder="e.g. Cristiano Ronaldo"
          value={formData.name}
          disabled={isLoading}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, name: e.target.value }));
            if (formErrors.name) {
              setFormErrors((prev) => ({ ...prev, name: "" }));
            }
          }}
        />
        {formErrors.name && <FieldError>{formErrors.name}</FieldError>}
      </Field>

      <Field data-invalid={!!formErrors.email}>
        <FieldLabel htmlFor="user-email">Email Address</FieldLabel>
        <Input
          id="user-email"
          type="email"
          placeholder="e.g. cr7@workmail.com"
          value={formData.email}
          disabled={isLoading}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, email: e.target.value }));
            if (formErrors.email) {
              setFormErrors((prev) => ({ ...prev, email: "" }));
            }
          }}
        />
        {formErrors.email && <FieldError>{formErrors.email}</FieldError>}
      </Field>

      <Field data-invalid={!!formErrors.password}>
        <FieldLabel htmlFor="user-password">
          {isEdit ? "New Password (Optional)" : "Password"}
        </FieldLabel>
        <Input
          id="user-password"
          type="password"
          placeholder={
            isEdit ? "Leave blank to keep existing password" : "Password#123"
          }
          value={formData.password}
          disabled={isLoading}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, password: e.target.value }));
            if (formErrors.password) {
              setFormErrors((prev) => ({ ...prev, password: "" }));
            }
          }}
        />
        {formErrors.password && <FieldError>{formErrors.password}</FieldError>}
        {!isEdit && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Must be at least 8 characters and contain uppercase, lowercase,
            numbers, and symbols.
          </p>
        )}
      </Field>

      <div className="flex items-center gap-2 py-1">
        <Checkbox
          id={`is-admin-${mode}`}
          checked={formData.isAdmin}
          disabled={isLoading}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isAdmin: !!checked }))
          }
        />
        <Label
          htmlFor={`is-admin-${mode}`}
          className="text-xs cursor-pointer select-none"
        >
          Grant Global Administrator Role
        </Label>
      </div>

      {!formData.isAdmin && (
        <Field>
          <FieldLabel>Assigned Associations</FieldLabel>
          <DropdownMenu
            open={isDropdownOpen}
            onOpenChange={handleDropdownOpenChange}
          >
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={isDropdownOpen}
                  className="w-full justify-between font-normal h-9 px-3 text-xs border-input hover:bg-accent/50"
                  disabled={isLoading || associations.length === 0}
                >
                  {selectedAssociations.length === 0 ? (
                    <span className="text-muted-foreground font-medium">
                      {associations.length === 0
                        ? "No associations available"
                        : "Select associations..."}
                    </span>
                  ) : selectedAssociations.length === 1 ? (
                    <span className="truncate text-foreground font-medium">
                      {selectedAssociations[0].acronym ||
                        selectedAssociations[0].name}
                    </span>
                  ) : (
                    <span className="truncate text-foreground font-medium">
                      {selectedAssociations.length} associations selected
                    </span>
                  )}
                  <ChevronsUpDown className="size-3.5 shrink-0 opacity-50 ml-2" />
                </Button>
              }
            />
            <DropdownMenuContent
              className="w-(--anchor-width) min-w-72 p-2"
              align="start"
              sideOffset={4}
            >
              <div className="flex flex-row items-center justify-between gap-2 p-1.5">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search associations..."
                    value={associationSearch}
                    onChange={(e) => setAssociationSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="h-8 pl-8 pr-2 text-xs"
                    autoFocus
                  />
                </div>
                {formData.associationIds.length > 0 && (
                  <button
                    type="button"
                    className="text-[11px] text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllAssociations();
                    }}
                  >
                    Clear all
                  </button>
                )}
              </div>
              <DropdownMenuGroup>
                <div className="max-h-52 overflow-y-auto space-y-0.5 mt-1">
                  {filteredAssociations.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      No associations found
                    </div>
                  ) : (
                    filteredAssociations.map((assoc) => {
                      const isSelected = formData.associationIds.includes(
                        assoc.id,
                      );
                      const displayTitle = assoc.acronym || assoc.name;
                      return (
                        <DropdownMenuCheckboxItem
                          key={assoc.id}
                          checked={isSelected}
                          closeOnClick={false}
                          onCheckedChange={() => toggleAssociation(assoc.id)}
                          className="gap-2.5 py-1.5 px-2 cursor-pointer rounded-md"
                        >
                          <Avatar className="h-6 w-6 rounded-sm shrink-0 after:rounded-sm">
                            <AvatarFallback className="rounded-sm bg-primary/10 text-primary text-[10px] font-semibold">
                              {getInitials(displayTitle)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col flex-1 min-w-0 pr-2">
                            <span className="font-medium text-xs truncate">
                              {displayTitle}
                            </span>
                            {assoc.acronym &&
                              assoc.name &&
                              assoc.acronym !== assoc.name && (
                                <span className="text-[10px] text-muted-foreground truncate">
                                  {assoc.name}
                                </span>
                              )}
                          </div>
                        </DropdownMenuCheckboxItem>
                      );
                    })
                  )}
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </Field>
      )}
    </FormDialog>
  );
}
