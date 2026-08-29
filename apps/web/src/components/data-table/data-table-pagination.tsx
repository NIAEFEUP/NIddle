import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const totalItems = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Rows per page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-16 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[6, 12, 24, 48].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-muted-foreground">
        {totalItems > 0
          ? `${pageIndex * pageSize + 1}-${Math.min((pageIndex + 1) * pageSize, totalItems)} of ${pageCount} pages`
          : "0-0 of 0 pages"}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 w-8"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 w-8"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="size-4" />
        </Button>

        {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
          let pageNum = pageIndex + 1;
          if (pageIndex <= 2) {
            pageNum = i + 1;
          } else if (pageIndex >= pageCount - 2) {
            pageNum = pageCount - 4 + i;
          } else {
            pageNum = pageIndex - 2 + i;
          }

          if (pageNum < 1 || pageNum > pageCount) return null;

          return (
            <Button
              key={pageNum}
              variant={pageIndex + 1 === pageNum ? "secondary" : "outline"}
              size="sm"
              className="h-8 w-8 text-xs p-0"
              onClick={() => table.setPageIndex(pageNum - 1)}
            >
              {pageNum}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 w-8"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 w-8"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
