import * as React from "react";
import { FormDialog } from "@/components/common/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Association } from "@/hooks/use-auth";

export interface AssociationFormData {
  name: string;
  acronym?: string;
}

interface AssociationFormDialogProps {
  mode?: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  association?: Association | null;
  onSubmit: (data: AssociationFormData) => void;
  isLoading?: boolean;
}

export function AssociationFormDialog({
  mode,
  open,
  onOpenChange,
  association,
  onSubmit,
  isLoading,
}: AssociationFormDialogProps) {
  const isEdit = mode === "edit" || Boolean(association);

  const [formData, setFormData] = React.useState<AssociationFormData>({
    name: "",
    acronym: "",
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
    {},
  );

  React.useEffect(() => {
    if (!open) return;
    if (association) {
      setFormData({
        name: association.name,
        acronym: association.acronym || "",
      });
    } else {
      setFormData({
        name: "",
        acronym: "",
      });
    }
    setFormErrors({});
  }, [association, open]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = "Association name is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: formData.name.trim(),
      acronym: isEdit
        ? (formData.acronym?.trim() ?? "")
        : formData.acronym?.trim() || undefined,
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Association" : "Create Association"}
      description={
        isEdit
          ? "Update the association details below."
          : "Enter the details to create a new association."
      }
      isLoading={isLoading}
      submitLabel={isEdit ? "Save Changes" : "Create Association"}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="association-name">Name</Label>
          <Input
            id="association-name"
            placeholder="e.g. Núcleo de Informática da AEFESP"
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              if (formErrors.name) {
                setFormErrors((prev) => ({ ...prev, name: "" }));
              }
            }}
            disabled={isLoading}
            autoFocus
          />
          {formErrors.name && (
            <p className="text-xs text-destructive">{formErrors.name}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="association-acronym">Acronym</Label>
          <Input
            id="association-acronym"
            placeholder="e.g. NIAEFESP"
            value={formData.acronym}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, acronym: e.target.value }))
            }
            disabled={isLoading}
          />
          <p className="text-[11px] text-muted-foreground">
            Optional short name or abbreviation for the association.
          </p>
        </div>
      </div>
    </FormDialog>
  );
}
