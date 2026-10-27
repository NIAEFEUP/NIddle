import * as React from "react";
import { FormDialog } from "@/components/common/form-dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export interface RequestRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: string;
  isLoading?: boolean;
  onSubmit: (rejectionReason: string) => void;
}

export function RequestRejectDialog({
  open,
  onOpenChange,
  subject,
  isLoading = false,
  onSubmit,
}: RequestRejectDialogProps) {
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setReason("");
      setError("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("A rejection reason is required.");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Reject Request"
      description={
        subject
          ? `Explain why "${subject}" is being rejected. The association will see this reason.`
          : "Explain why this request is being rejected."
      }
      isEdit
      isLoading={isLoading}
      submitLabel="Reject Request"
      onSubmit={handleSubmit}
    >
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor="request-rejection-reason">Reason</FieldLabel>
        <Input
          id="request-rejection-reason"
          placeholder="e.g. Missing event date"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError("");
          }}
          disabled={isLoading}
          autoFocus
        />
        {error && <FieldError>{error}</FieldError>}
      </Field>
    </FormDialog>
  );
}
