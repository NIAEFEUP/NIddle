import {
  type ColumnFiltersState,
  type ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { CheckCircle2, Clock, Download, XCircle } from "lucide-react";
import * as React from "react";
import {
  getRequestColumns,
  requestColumnLabels,
} from "@/components/admin/requests/request-columns";
import { RequestDetails } from "@/components/admin/requests/request-details";
import { RequestGridCard } from "@/components/admin/requests/request-grid-card";
import { RequestRejectDialog } from "@/components/admin/requests/request-reject-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { SearchInput } from "@/components/common/search-input";
import { BulkActions } from "@/components/data-table/bulk-actions";
import { DataTableColumnToggle } from "@/components/data-table/data-table-column-toggle";
import {
  DataTableFilter,
  type DataTableFilterOption,
} from "@/components/data-table/data-table-filter";
import { DataTableView } from "@/components/data-table/data-table-view";
import { GridView } from "@/components/data-table/grid-view";
import {
  type ViewMode,
  ViewModeToggle,
} from "@/components/data-table/view-mode-toggle";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  type AdminRequest,
  getRequestSubject,
  REQUEST_ACTIONS,
  REQUEST_TYPES,
  useAdminRequests,
} from "@/hooks/use-admin-requests";
import { getErrorMessage } from "@/lib/api-client";
import { downloadCsv } from "@/lib/csv-export";

const statusFilterOptions: DataTableFilterOption[] = [
  { value: "Pending", label: "Pending", icon: <Clock className="size-3.5" /> },
  {
    value: "Approved",
    label: "Approved",
    icon: <CheckCircle2 className="size-3.5" />,
  },
  {
    value: "Rejected",
    label: "Rejected",
    icon: <XCircle className="size-3.5" />,
  },
];

const typeFilterOptions: DataTableFilterOption[] = REQUEST_TYPES.map(
  (type) => ({ value: type, label: type }),
);

const actionFilterOptions: DataTableFilterOption[] = REQUEST_ACTIONS.map(
  (action) => ({ value: action, label: action }),
);

function exportRequestsToCsv(requestsList: AdminRequest[], filename: string) {
  const headers = [
    "ID",
    "Subject",
    "Type",
    "Action",
    "Status",
    "Association",
    "Requested By",
    "Created At",
    "Reviewed At",
    "Rejection Reason",
  ];
  const rows = requestsList.map((r) => [
    r.id,
    getRequestSubject(r),
    r.type,
    r.action,
    r.status,
    r.targetAssociation?.acronym || r.targetAssociation?.name || "",
    r.requestedBy?.name ?? "",
    r.createdAt,
    r.reviewedAt ?? "",
    r.rejectionReason ?? "",
  ]);
  downloadCsv(filename, headers, rows);
}

export function AdminRequestsPage() {
  const {
    requests,
    isLoading,
    isError,
    error,
    approveRequestMutation,
    rejectRequestMutation,
  } = useAdminRequests();

  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  const [typeFilter, setTypeFilter] = React.useState<string[]>([]);
  const [actionFilter, setActionFilter] = React.useState<string[]>([]);
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [isApproveOpen, setIsApproveOpen] = React.useState(false);
  const [isRejectOpen, setIsRejectOpen] = React.useState(false);
  const [selectedRequest, setSelectedRequest] =
    React.useState<AdminRequest | null>(null);

  const handleOpenApprove = React.useCallback((request: AdminRequest) => {
    setSelectedRequest(request);
    setIsApproveOpen(true);
  }, []);

  const handleOpenReject = React.useCallback((request: AdminRequest) => {
    setSelectedRequest(request);
    setIsRejectOpen(true);
  }, []);

  const columns = React.useMemo(
    () =>
      getRequestColumns({
        onApprove: handleOpenApprove,
        onReject: handleOpenReject,
      }),
    [handleOpenApprove, handleOpenReject],
  );

  const table = useReactTable({
    data: requests,
    columns,
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getRowId: (row) => row.id,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      pagination: {
        pageIndex: 0,
        pageSize: 12,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      expanded,
    },
  });

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    table.setPageIndex(0);
  };

  const handleColumnFilterChange =
    (columnId: string, setValues: (values: string[]) => void) =>
    (values: string[]) => {
      setValues(values);
      table.getColumn(columnId)?.setFilterValue(values);
      table.setPageIndex(0);
    };

  const handleApproveConfirm = () => {
    if (!selectedRequest) return;
    approveRequestMutation.mutate(selectedRequest.id, {
      onSuccess: () => {
        setIsApproveOpen(false);
        setSelectedRequest(null);
      },
    });
  };

  const handleRejectSubmit = (rejectionReason: string) => {
    if (!selectedRequest) return;
    rejectRequestMutation.mutate(
      { id: selectedRequest.id, rejectionReason },
      {
        onSuccess: () => {
          setIsRejectOpen(false);
          setSelectedRequest(null);
        },
      },
    );
  };

  const selectedRows = table
    .getFilteredRowModel()
    .rows.filter((row) => row.getIsSelected());
  const selectedRequests = selectedRows.map((row) => row.original);
  const selectedCount = selectedRequests.length;

  const handleExportSelected = () => {
    if (selectedRequests.length === 0) return;
    exportRequestsToCsv(
      selectedRequests,
      `requests_selected_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const handleClearSelection = () => {
    table.resetRowSelection();
  };

  const handleDownloadCSV = () => {
    const filteredRequests = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);
    exportRequestsToCsv(
      filteredRequests,
      `requests_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const selectedSubject = selectedRequest
    ? getRequestSubject(selectedRequest)
    : undefined;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Requests"
        viewModeToggle={
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        }
        search={
          <SearchInput
            placeholder="Search Requests"
            value={globalFilter}
            onChange={handleSearchChange}
          />
        }
        actions={
          <>
            {viewMode === "list" && (
              <DataTableColumnToggle
                table={table}
                columnLabels={requestColumnLabels}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-normal border-input"
              onClick={handleDownloadCSV}
            >
              <Download className="size-3.5" />
              Download CSV
            </Button>
          </>
        }
        filters={
          <>
            <DataTableFilter
              title="Status"
              pluralTitle="Statuses"
              options={statusFilterOptions}
              selectedValues={statusFilter}
              onSelectedValuesChange={handleColumnFilterChange(
                "status",
                setStatusFilter,
              )}
            />
            <DataTableFilter
              title="Type"
              options={typeFilterOptions}
              selectedValues={typeFilter}
              onSelectedValuesChange={handleColumnFilterChange(
                "type",
                setTypeFilter,
              )}
            />
            <DataTableFilter
              title="Action"
              options={actionFilterOptions}
              selectedValues={actionFilter}
              onSelectedValuesChange={handleColumnFilterChange(
                "action",
                setActionFilter,
              )}
            />
          </>
        }
      />

      <DataTableView
        table={table}
        viewMode={viewMode}
        isLoading={isLoading}
        loadingMessage="Loading requests..."
        isError={isError}
        errorTitle="Failed to load requests"
        errorMessage={getErrorMessage(error)}
        emptyTitle="No requests found"
        emptyDescription="Try resetting your filters or search query."
        renderSubComponent={(row) => <RequestDetails request={row.original} />}
        renderGrid={(t) => (
          <GridView
            table={t}
            renderCard={(request, { isSelected, onSelectChange, row }) => (
              <RequestGridCard
                request={request}
                isSelected={isSelected}
                onSelectChange={onSelectChange}
                isExpanded={row.getIsExpanded()}
                onExpandedChange={row.toggleExpanded}
                onApprove={handleOpenApprove}
                onReject={handleOpenReject}
              />
            )}
          />
        )}
      />

      <BulkActions
        selectedCount={selectedCount}
        entityLabel="request"
        entityPluralLabel="requests"
        onExport={handleExportSelected}
        onClear={handleClearSelection}
      />

      <ConfirmDialog
        open={isApproveOpen}
        onOpenChange={setIsApproveOpen}
        title="Approve Request"
        description={
          selectedRequest
            ? `Approving will ${selectedRequest.action.split(" ")[0].toLowerCase()} the ${selectedRequest.type.toLowerCase()} "${selectedSubject}". This cannot be undone.`
            : "Approve this request?"
        }
        confirmLabel="Approve"
        loadingLabel="Approving..."
        isLoading={approveRequestMutation.isPending}
        onConfirm={handleApproveConfirm}
      />

      <RequestRejectDialog
        open={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        subject={selectedSubject}
        isLoading={rejectRequestMutation.isPending}
        onSubmit={handleRejectSubmit}
      />
    </div>
  );
}

export default AdminRequestsPage;
