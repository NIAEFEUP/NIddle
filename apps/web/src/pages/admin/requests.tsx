import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { Calendar, Check, Clock, Download, Layers, X } from "lucide-react";
import * as React from "react";
import { RejectReasonDialog } from "@/components/admin/requests/reject-reason-dialog";
import {
  getRequestColumns,
  requestColumnLabels,
} from "@/components/admin/requests/request-columns";
import { RequestDetailDialog } from "@/components/admin/requests/request-detail-dialog";
import { RequestGridCard } from "@/components/admin/requests/request-grid-card";
import {
  getRequestSubtitle,
  getRequestTitle,
  type RequestItem,
} from "@/components/admin/requests/request-types";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
  BulkDeleteDialog,
  DeleteDialog,
} from "@/components/common/delete-dialog";
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
import { useAdminRequests } from "@/hooks/use-admin-requests";
import { getErrorMessage } from "@/lib/api-client";
import { downloadCsv } from "@/lib/csv-export";

function exportRequestsToCsv(requests: RequestItem[]) {
  const filename = `requests-${new Date().toISOString().slice(0, 10)}.csv`;
  const headers = [
    "ID",
    "Resource Title",
    "Type",
    "Action",
    "Target Association",
    "Requester Name",
    "Requester Email",
    "Status",
    "Rejection Reason",
    "Created At",
    "Reviewed At",
  ];
  const rows = requests.map((r) => [
    r.id,
    getRequestTitle(r),
    r.type,
    r.action,
    r.targetAssociation?.acronym || r.targetAssociation?.name || "",
    r.requestedBy?.name || "",
    r.requestedBy?.email || "",
    r.status,
    r.rejectionReason || "",
    r.createdAt,
    r.reviewedAt || "",
  ]);
  downloadCsv(filename, headers, rows);
}

export function AdminRequestsPage() {
  const {
    requests,
    associations,
    isLoading,
    isError,
    error,
    approveRequestMutation,
    rejectRequestMutation,
    deleteRequestMutation,
    bulkApproveRequestsMutation,
    bulkRejectRequestsMutation,
    bulkDeleteRequestsMutation,
  } = useAdminRequests();

  const [viewMode, setViewMode] = React.useState<ViewMode>("list");

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [statusFilter, setStatusFilter] = React.useState<string[]>(["Pending"]);
  const [typeFilter, setTypeFilter] = React.useState<string[]>([]);
  const [actionFilter, setActionFilter] = React.useState<string[]>([]);
  const [associationFilter, setAssociationFilter] = React.useState<string[]>(
    [],
  );

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    { id: "status", value: ["Pending"] },
  ]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [selectedRequest, setSelectedRequest] =
    React.useState<RequestItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isApproveOpen, setIsApproveOpen] = React.useState(false);
  const [isRejectOpen, setIsRejectOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const [isBulkApproveOpen, setIsBulkApproveOpen] = React.useState(false);
  const [isBulkRejectOpen, setIsBulkRejectOpen] = React.useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false);

  // Row action handlers
  const handleOpenDetail = React.useCallback((request: RequestItem) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  }, []);

  const handleOpenApprove = React.useCallback((request: RequestItem) => {
    setSelectedRequest(request);
    setIsApproveOpen(true);
  }, []);

  const handleOpenReject = React.useCallback((request: RequestItem) => {
    setSelectedRequest(request);
    setIsRejectOpen(true);
  }, []);

  const handleOpenDelete = React.useCallback((request: RequestItem) => {
    setSelectedRequest(request);
    setIsDeleteOpen(true);
  }, []);

  const columns = React.useMemo(
    () =>
      getRequestColumns({
        onViewDetails: handleOpenDetail,
        onApprove: handleOpenApprove,
        onReject: handleOpenReject,
        onDelete: handleOpenDelete,
      }),
    [handleOpenDetail, handleOpenApprove, handleOpenReject, handleOpenDelete],
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
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      if (!filterValue) return true;
      const q = filterValue.toLowerCase().trim();
      const r = row.original;
      const title = getRequestTitle(r).toLowerCase();
      const subtitle = getRequestSubtitle(r).toLowerCase();
      const assoc = (
        r.targetAssociation?.name ||
        r.targetAssociation?.acronym ||
        ""
      ).toLowerCase();
      const requester = (r.requestedBy?.name || "").toLowerCase();
      const email = (r.requestedBy?.email || "").toLowerCase();
      const reason = (r.rejectionReason || "").toLowerCase();
      const type = r.type.toLowerCase();
      const action = r.action.toLowerCase();

      return (
        title.includes(q) ||
        subtitle.includes(q) ||
        assoc.includes(q) ||
        requester.includes(q) ||
        email.includes(q) ||
        reason.includes(q) ||
        type.includes(q) ||
        action.includes(q)
      );
    },
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
    },
  });

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    table.setPageIndex(0);
  };

  const handleStatusFilterChange = (values: string[]) => {
    setStatusFilter(values);
    table
      .getColumn("status")
      ?.setFilterValue(values.length ? values : undefined);
    table.setPageIndex(0);
  };

  const handleTypeFilterChange = (values: string[]) => {
    setTypeFilter(values);
    table.getColumn("type")?.setFilterValue(values.length ? values : undefined);
    table.setPageIndex(0);
  };

  const handleActionFilterChange = (values: string[]) => {
    setActionFilter(values);
    table
      .getColumn("action")
      ?.setFilterValue(values.length ? values : undefined);
    table.setPageIndex(0);
  };

  const handleAssociationFilterChange = (values: string[]) => {
    setAssociationFilter(values);
    table
      .getColumn("targetAssociation")
      ?.setFilterValue(values.length ? values : undefined);
    table.setPageIndex(0);
  };

  const selectedRequests = React.useMemo(() => {
    const selectedIndices = Object.keys(rowSelection);
    return selectedIndices
      .map((index) => table.getRowModel().rowsById[index]?.original)
      .filter((item): item is RequestItem => !!item);
  }, [rowSelection, table]);

  const pendingSelectedRequests = React.useMemo(
    () => selectedRequests.filter((r) => r.status === "Pending"),
    [selectedRequests],
  );

  const handleExportSelected = () => {
    exportRequestsToCsv(selectedRequests);
  };

  const handleExportAll = () => {
    exportRequestsToCsv(requests);
  };

  const statusOptions: DataTableFilterOption[] = [
    {
      value: "Pending",
      label: "Pending",
      icon: <Clock className="size-3 text-amber-500" />,
    },
    {
      value: "Approved",
      label: "Approved",
      icon: <Check className="size-3 text-emerald-500" />,
    },
    {
      value: "Rejected",
      label: "Rejected",
      icon: <X className="size-3 text-rose-500" />,
    },
  ];

  const typeOptions: DataTableFilterOption[] = [
    {
      value: "Event",
      label: "Event",
      icon: <Calendar className="size-3" />,
    },
    {
      value: "Service",
      label: "Service",
      icon: <Layers className="size-3" />,
    },
  ];

  const actionOptions: DataTableFilterOption[] = [
    { value: "Create", label: "Create" },
    { value: "Update Existing", label: "Update" },
    { value: "Delete Existing", label: "Delete" },
  ];

  const associationOptions: DataTableFilterOption[] = React.useMemo(
    () =>
      associations.map((assoc) => ({
        value: assoc.id,
        label: assoc.acronym || assoc.name,
      })),
    [associations],
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Requests"
        viewModeToggle={
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        }
        search={
          <SearchInput
            placeholder="Search requests..."
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
              onClick={handleExportAll}
              disabled={requests.length === 0}
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
              options={statusOptions}
              selectedValues={statusFilter}
              onSelectedValuesChange={handleStatusFilterChange}
            />

            <DataTableFilter
              title="Type"
              pluralTitle="Types"
              options={typeOptions}
              selectedValues={typeFilter}
              onSelectedValuesChange={handleTypeFilterChange}
            />

            <DataTableFilter
              title="Action"
              pluralTitle="Actions"
              options={actionOptions}
              selectedValues={actionFilter}
              onSelectedValuesChange={handleActionFilterChange}
            />

            {associationOptions.length > 0 && (
              <DataTableFilter
                title="Association"
                pluralTitle="Associations"
                options={associationOptions}
                selectedValues={associationFilter}
                onSelectedValuesChange={handleAssociationFilterChange}
              />
            )}
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
        emptyDescription={
          statusFilter.length > 0 || globalFilter
            ? "Try adjusting your filters or search term to see more requests."
            : "No requests have been submitted by associations yet."
        }
        renderGrid={(t) => (
          <GridView
            table={t}
            renderCard={(
              request: RequestItem,
              { isSelected, onSelectChange },
            ) => (
              <RequestGridCard
                key={request.id}
                request={request}
                isSelected={isSelected}
                onSelectChange={onSelectChange}
                onViewDetails={handleOpenDetail}
                onApprove={handleOpenApprove}
                onReject={handleOpenReject}
                onDelete={handleOpenDelete}
              />
            )}
          />
        )}
      />

      <BulkActions
        selectedCount={selectedRequests.length}
        entityLabel="request"
        entityPluralLabel="requests"
        onExport={handleExportSelected}
        onDelete={() => setIsBulkDeleteOpen(true)}
        onClear={() => setRowSelection({})}
      >
        {pendingSelectedRequests.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50/10 gap-1.5"
              onClick={() => setIsBulkRejectOpen(true)}
            >
              <X className="size-3.5" />
              Reject ({pendingSelectedRequests.length})
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={() => setIsBulkApproveOpen(true)}
            >
              <Check className="size-3.5" />
              Approve ({pendingSelectedRequests.length})
            </Button>
          </div>
        )}
      </BulkActions>

      <RequestDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        request={selectedRequest}
        onApprove={(req) => {
          setSelectedRequest(req);
          setIsApproveOpen(true);
        }}
        onReject={(req) => {
          setSelectedRequest(req);
          setIsRejectOpen(true);
        }}
      />

      <ConfirmDialog
        open={isApproveOpen}
        onOpenChange={setIsApproveOpen}
        title="Approve Request"
        description={
          <>
            Are you sure you want to approve the request for{" "}
            <span className="font-semibold text-foreground">
              &ldquo;
              {selectedRequest ? getRequestTitle(selectedRequest) : ""}
              &rdquo;
            </span>
            ? This will immediately apply the proposed{" "}
            <span className="font-medium">
              {selectedRequest?.action.toLowerCase()}
            </span>{" "}
            operation.
          </>
        }
        confirmLabel="Approve Request"
        cancelLabel="Cancel"
        variant="default"
        isLoading={approveRequestMutation.isPending}
        loadingLabel="Approving..."
        onConfirm={() => {
          if (!selectedRequest) return;
          approveRequestMutation.mutate(selectedRequest.id, {
            onSuccess: () => {
              setIsApproveOpen(false);
              setSelectedRequest(null);
            },
          });
        }}
      />

      <ConfirmDialog
        open={isBulkApproveOpen}
        onOpenChange={setIsBulkApproveOpen}
        title={`Approve ${pendingSelectedRequests.length} Requests`}
        description={
          <>
            Are you sure you want to approve{" "}
            <span className="font-semibold text-foreground">
              {pendingSelectedRequests.length} pending{" "}
              {pendingSelectedRequests.length === 1 ? "request" : "requests"}
            </span>
            ? This will immediately execute and apply all their proposed
            changes.
          </>
        }
        confirmLabel={`Approve ${pendingSelectedRequests.length} Requests`}
        cancelLabel="Cancel"
        isLoading={bulkApproveRequestsMutation.isPending}
        loadingLabel="Approving..."
        onConfirm={() => {
          bulkApproveRequestsMutation.mutate(
            pendingSelectedRequests.map((r) => r.id),
            {
              onSuccess: () => {
                setIsBulkApproveOpen(false);
                setRowSelection({});
              },
            },
          );
        }}
      />

      <RejectReasonDialog
        open={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        itemTitle={
          selectedRequest ? getRequestTitle(selectedRequest) : undefined
        }
        isLoading={rejectRequestMutation.isPending}
        onConfirm={(reason) => {
          if (!selectedRequest) return;
          rejectRequestMutation.mutate(
            { id: selectedRequest.id, rejectionReason: reason },
            {
              onSuccess: () => {
                setIsRejectOpen(false);
                setSelectedRequest(null);
              },
            },
          );
        }}
      />

      <RejectReasonDialog
        open={isBulkRejectOpen}
        onOpenChange={setIsBulkRejectOpen}
        count={pendingSelectedRequests.length}
        isLoading={bulkRejectRequestsMutation.isPending}
        onConfirm={(reason) => {
          bulkRejectRequestsMutation.mutate(
            {
              ids: pendingSelectedRequests.map((r) => r.id),
              rejectionReason: reason,
            },
            {
              onSuccess: () => {
                setIsBulkRejectOpen(false);
                setRowSelection({});
              },
            },
          );
        }}
      />

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        entityName="Request"
        itemName={
          selectedRequest ? getRequestTitle(selectedRequest) : undefined
        }
        isLoading={deleteRequestMutation.isPending}
        onConfirm={() => {
          if (!selectedRequest) return;
          deleteRequestMutation.mutate(selectedRequest.id, {
            onSuccess: () => {
              setIsDeleteOpen(false);
              setSelectedRequest(null);
            },
          });
        }}
      />

      <BulkDeleteDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        selectedCount={selectedRequests.length}
        entityLabel="request"
        isLoading={bulkDeleteRequestsMutation.isPending}
        onConfirm={() => {
          bulkDeleteRequestsMutation.mutate(
            selectedRequests.map((r) => r.id),
            {
              onSuccess: () => {
                setIsBulkDeleteOpen(false);
                setRowSelection({});
              },
            },
          );
        }}
      />
    </div>
  );
}

export default AdminRequestsPage;
