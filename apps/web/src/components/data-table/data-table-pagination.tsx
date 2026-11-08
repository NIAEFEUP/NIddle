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

  const windowSize = Math.min(5, pageCount);
  let startPage = 1;
  if (pageCount > windowSize) {
    if (pageIndex <= Math.floor(windowSize / 2)) {
      startPage = 1;
    } else if (pageIndex >= pageCount - Math.floor(windowSize / 2)) {
      startPage = pageCount - windowSize + 1;
    } else {
      startPage = pageIndex - Math.floor(windowSize / 2) + 1;
    }
  }

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
          <SelectTrigger
            className="h-8 w-16 text-xs"
            aria-label="Rows per page"
          >
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
          ? `${pageIndex * pageSize + 1}-${Math.min((pageIndex + 1) * pageSize, totalItems)} of ${totalItems}`
          : "0-0 of 0"}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 w-8"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 w-8"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {Array.from({ length: windowSize }, (_, i) => {
          const pageNum = startPage + i;
          return (
            <Button
              key={pageNum}
              variant={pageIndex + 1 === pageNum ? "secondary" : "outline"}
              size="sm"
              className="h-8 w-8 text-xs p-0"
              onClick={() => table.setPageIndex(pageNum - 1)}
              aria-label={`Go to page ${pageNum}`}
              aria-current={pageIndex + 1 === pageNum ? "page" : undefined}
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
          aria-label="Go to next page"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 w-8"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          aria-label="Go to last page"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
