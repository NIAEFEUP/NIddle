import type { Row, Table } from "@tanstack/react-table";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface GridViewProps<T> {
  table: Table<T>;
  renderCard: (
    item: T,
    helpers: {
      isSelected: boolean;
      onSelectChange: (selected: boolean) => void;
      row: Row<T>;
    },
  ) => React.ReactNode;
  getItemKey?: (item: T, index: number) => React.Key;
  className?: string;
}

export function GridView<T>({
  table,
  renderCard,
  getItemKey,
  className,
}: GridViewProps<T>) {
  const rows = table.getRowModel().rows;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
        className,
      )}
    >
      {rows.map((row, index) => {
        const item = row.original;
        const key = getItemKey
          ? getItemKey(item, index)
          : ((item as { id?: React.Key }).id ?? row.id);

        return (
          <React.Fragment key={key}>
            {renderCard(item, {
              isSelected: row.getIsSelected(),
              onSelectChange: (selected) => row.toggleSelected(selected),
              row,
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}
