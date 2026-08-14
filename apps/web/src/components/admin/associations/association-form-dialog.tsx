import * as React from "react";
import { AdminFormDialog } from "@/components/admin/admin-form-dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { AssociationFormData } from "@/hooks/use-admin-associations";
import type { Association } from "@/hooks/use-auth";

export interface AssociationFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  association?: Association | null;
  isLoading: boolean;
  onSubmit: (formData: AssociationFormData) => void;
}

export function AssociationFormDialog({
  mode,
  open,
  onOpenChange,
  association,
  isLoading,
  onSubmit,
}: AssociationFormDialogProps) {
  const isEdit = mode === "edit";

  const [formData, setFormData] = React.useState<AssociationFormData>({
    name: "",
    acronym: "",
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
    {},
  );

  React.useEffect(() => {
    if (open) {
      if (isEdit && association) {
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
    }
  }, [open, isEdit, association]);

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
      acronym: formData.acronym?.trim() || undefined,
    });
  };

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Association" : "Create Association"}
      description={
        isEdit
          ? "Update the association details below."
          : "Enter the details to create a new association."
      }
      isEdit={isEdit}
      isLoading={isLoading}
      submitLabel={isEdit ? "Save Changes" : "Create Association"}
      onSubmit={handleSubmit}
    >
      <Field data-invalid={!!formErrors.name}>
        <FieldLabel htmlFor="association-name">Name</FieldLabel>
        <Input
          id="association-name"
          placeholder="e.g. Núcleo de Informática"
          value={formData.name}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, name: e.target.value }));
            if (formErrors.name) {
              setFormErrors((prev) => ({ ...prev, name: "" }));
            }
          }}
          disabled={isLoading}
        />
        {formErrors.name && <FieldError>{formErrors.name}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="association-acronym">
          Acronym{" "}
          <span className="text-xs text-muted-foreground font-normal">
            (optional)
          </span>
        </FieldLabel>
        <Input
          id="association-acronym"
          placeholder="e.g. NIAEFEUP"
          value={formData.acronym}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, acronym: e.target.value }));
          }}
          disabled={isLoading}
        />
      </Field>
    </AdminFormDialog>
  );
}
