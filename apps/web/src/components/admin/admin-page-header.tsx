import * as React from "react";

export interface AdminPageHeaderProps {
  title: React.ReactNode;
  viewModeToggle?: React.ReactNode;
  search?: React.ReactNode;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  viewModeToggle,
  search,
  actions,
  filters,
  className,
  children,
}: AdminPageHeaderProps) {
  return (
    <div
      className={
        className ? `flex flex-col gap-4 ${className}` : "flex flex-col gap-4"
      }
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-4">
          {typeof title === "string" ? (
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
          ) : (
            title
          )}
          {viewModeToggle}
        </div>

        {(search || actions) && (
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
            {search}
            {actions}
          </div>
        )}
      </div>

      {filters && (
        <div className="flex flex-wrap items-center gap-3">{filters}</div>
      )}

      {children}
    </div>
  );
}
