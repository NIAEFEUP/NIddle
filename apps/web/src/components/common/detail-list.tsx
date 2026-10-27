import { ChevronDown } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DetailMuted({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>;
}

export function DetailList({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-xs">
      {children}
    </dl>
  );
}

export function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-foreground">{children}</dd>
    </>
  );
}

export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <h4 className="text-[11px] font-semibold uppercase text-muted-foreground">
        {title}
      </h4>
      {children}
    </section>
  );
}

export function DetailPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-6 p-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Spacing for a DetailPanel rendered inside a GridCard. */
export const gridCardDetailPanelClassName = "-mx-4 border-t md:grid-cols-1";

export interface DetailsToggleProps {
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

export function DetailsToggle({
  isExpanded,
  onExpandedChange,
}: DetailsToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 self-start px-2 text-xs text-muted-foreground"
      onClick={() => onExpandedChange(!isExpanded)}
      aria-expanded={isExpanded}
    >
      <ChevronDown
        className={cn(
          "size-3 mr-1 transition-transform",
          isExpanded && "rotate-180",
        )}
      />
      {isExpanded ? "Hide details" : "Show details"}
    </Button>
  );
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
