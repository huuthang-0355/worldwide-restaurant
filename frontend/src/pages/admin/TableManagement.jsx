import { useState, useEffect, useMemo } from "react";
import { Plus, Download, LayoutGrid } from "lucide-react";
import { useTable } from "../../context/useTable";
import { useToast } from "../../context/useToast";
import PageHeader from "../../components/admin/PageHeader";
import StatCard from "../../components/admin/StatCard";
import TableFilters from "../../components/admin/TableFilters";
import TableTile from "../../components/admin/TableTile";
import TableForm from "../../components/admin/TableForm";
import QrCodeModal from "../../components/admin/QrCodeModal";
import EmptyState from "../../components/admin/EmptyState";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/ui/Button";
import tableService from "../../services/tableService";

/**
 * TableManagement - Full CRUD page for tables & QR codes
 * Matches the admin/tables.html mockup
 */
function TableManagement() {
    const {
        tables,
        loading,
        error,
        fetchTables,
        createTable,
        updateTable,
        updateTableStatus,
        deleteTable,
        generateQr,
        regenerateQr,
    } = useTable();
    const toast = useToast();

    // UI state
    const [filters, setFilters] = useState({});
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [qrTable, setQrTable] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [downloadingAll, setDownloadingAll] = useState(false);

    // Fetch tables on mount and when filters change
    useEffect(() => {
        const params = {};
        if (filters.status) params.status = filters.status;
        if (filters.location) params.location = filters.location;
        if (filters.sortBy) params.sortBy = filters.sortBy;
        fetchTables(params);
    }, [fetchTables, filters]);

    // Compute stats
    const stats = useMemo(() => {
        const total = tables.length;
        const active = tables.filter((t) => t.status === "ACTIVE").length;
        const inactive = tables.filter((t) => t.status === "INACTIVE").length;
        return { total, active, inactive };
    }, [tables]);

    // Extract unique locations for filter dropdown
    const uniqueLocations = useMemo(() => {
        const locs = new Set(tables.map((t) => t.location).filter(Boolean));
        return Array.from(locs).sort();
    }, [tables]);

    // ==================== Handlers ====================

    const handleCreate = async (formData) => {
        try {
            await createTable(formData);
            closeForm();
            toast.success("Table created successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to create table",
            );
            throw err;
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await updateTable(selectedTable.id, formData);
            closeForm();
            toast.success("Table updated successfully");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to update table",
            );
            throw err;
        }
    };

    const handleToggleStatus = async (id, newStatus) => {
        try {
            await updateTableStatus(id, newStatus);
            toast.success(
                `Table ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`,
            );
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to update status",
            );
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteTable(deleteTarget.id);
            toast.success("Table deleted");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to delete table",
            );
        } finally {
            setDeleteTarget(null);
        }
    };

    /**
     * Handle QR generate or regenerate from the QR modal
     * @param {string} tableId
     * @param {boolean} isRegenerate
     */
    const handleQrAction = async (tableId, isRegenerate) => {
        try {
            const result = isRegenerate
                ? await regenerateQr(tableId)
                : await generateQr(tableId);
            // Update local qrTable so the modal reflects the change
            setQrTable((prev) =>
                prev
                    ? {
                          ...prev,
                          hasQrCode: true,
                          qrTokenCreatedAt: result.generatedAt,
                      }
                    : prev,
            );
            toast.success(
                isRegenerate ? "QR code regenerated" : "QR code generated",
            );
            return result;
        } catch (err) {
            toast.error(err.response?.data?.message || "QR code action failed");
            throw err;
        }
    };

    const handleDownloadAll = async () => {
        setDownloadingAll(true);
        try {
            const blob = await tableService.downloadAllQr();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "all-tables-qr.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("All QR codes downloaded");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to download QR codes",
            );
        } finally {
            setDownloadingAll(false);
        }
    };

    // ==================== UI Helpers ====================

    const openEdit = (table) => {
        setSelectedTable(table);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setSelectedTable(null);
    };

    const openQr = (table) => {
        setQrTable(table);
        setIsQrOpen(true);
    };

    const closeQr = () => {
        setIsQrOpen(false);
        setQrTable(null);
    };

    // ==================== Render ====================

    if (loading && tables.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="large" text="Loading tables..." />
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <PageHeader
                title="Table Management"
                subtitle="Manage tables and generate QR codes"
                action={
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            icon={<Download className="w-4 h-4" />}
                            onClick={handleDownloadAll}
                            loading={downloadingAll}
                        >
                            Download All QR
                        </Button>
                        <Button
                            icon={<Plus className="w-4 h-4" />}
                            onClick={() => {
                                setSelectedTable(null);
                                setIsFormOpen(true);
                            }}
                        >
                            Add Table
                        </Button>
                    </div>
                }
            />

            {/* Error banner */}
            {error && (
                <div className="mb-6">
                    <ErrorMessage
                        message={error}
                        onRetry={() => fetchTables(filters)}
                    />
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard
                    label="Total Tables"
                    value={stats.total}
                    icon={<LayoutGrid className="w-6 h-6" />}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                />
                <StatCard
                    label="Active"
                    value={stats.active}
                    icon={
                        <span className="w-6 h-6 flex items-center justify-center text-lg">
                            ✅
                        </span>
                    }
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                />
                <StatCard
                    label="Inactive"
                    value={stats.inactive}
                    icon={
                        <span className="w-6 h-6 flex items-center justify-center text-lg">
                            🚫
                        </span>
                    }
                    iconBg="bg-amber-50"
                    iconColor="text-amber-600"
                />
            </div>

            {/* Filters */}
            <TableFilters
                filters={filters}
                onChange={setFilters}
                locations={uniqueLocations}
            />

            {/* Table grid */}
            {tables.length === 0 ? (
                <EmptyState
                    message="No tables found. Create your first table to get started."
                    action={
                        <Button
                            icon={<Plus className="w-4 h-4" />}
                            onClick={() => setIsFormOpen(true)}
                        >
                            Add Table
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tables.map((table) => (
                        <TableTile
                            key={table.id}
                            table={table}
                            onEdit={openEdit}
                            onToggleStatus={handleToggleStatus}
                            onViewQr={openQr}
                            onDelete={setDeleteTarget}
                        />
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={closeForm}
                title={selectedTable?.id ? "Edit Table" : "New Table"}
                size="medium"
            >
                <TableForm
                    table={selectedTable}
                    onSubmit={selectedTable?.id ? handleUpdate : handleCreate}
                    onCancel={closeForm}
                />
            </Modal>

            {/* QR Code Preview Modal */}
            <Modal
                isOpen={isQrOpen}
                onClose={closeQr}
                title={`QR Code — ${qrTable?.tableNumber || ""}`}
                size="large"
            >
                {qrTable && (
                    <QrCodeModal
                        table={qrTable}
                        onRegenerate={handleQrAction}
                        onClose={closeQr}
                    />
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Table"
                message={`Are you sure you want to delete "${deleteTarget?.tableNumber}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}

export default TableManagement;
