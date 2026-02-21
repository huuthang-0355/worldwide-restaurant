import { useState } from "react";
import {
    QrCode,
    RefreshCw,
    Users,
    MapPin,
    Calendar,
    FileText,
    Image,
} from "lucide-react";
import Button from "../ui/Button";
import tableService from "../../services/tableService";

/**
 * QrCodeModal - QR code preview, generation, regeneration, and download
 * Matches the mockup's QR Code Preview section
 */
function QrCodeModal({ table, onRegenerate }) {
    const [generating, setGenerating] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [downloading, setDownloading] = useState(null); // "png" | "pdf" | null
    const [qrData, setQrData] = useState(null);

    /**
     * Trigger file download from a blob
     */
    const triggerDownload = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const result = await onRegenerate(table.id, false);
            setQrData(result);
        } catch {
            // Error handled by parent
        } finally {
            setGenerating(false);
        }
    };

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const result = await onRegenerate(table.id, true);
            setQrData(result);
        } catch {
            // Error handled by parent
        } finally {
            setRegenerating(false);
        }
    };

    const handleDownload = async (format) => {
        setDownloading(format);
        try {
            const blob = await tableService.downloadQr(table.id, format);
            const ext = format === "pdf" ? "pdf" : "png";
            triggerDownload(blob, `qr-${table.tableNumber}.${ext}`);
        } catch {
            // Error handled by caller
        } finally {
            setDownloading(null);
        }
    };

    const createdAt = qrData?.generatedAt || table.qrTokenCreatedAt;

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Left: QR preview area */}
            <div className="shrink-0 flex flex-col items-center gap-4">
                {table.hasQrCode || qrData ? (
                    <>
                        <div className="w-52 h-52 bg-gray-900 rounded-xl flex items-center justify-center">
                            <QrCode className="w-36 h-36 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                            {table.tableNumber}
                        </p>
                    </>
                ) : (
                    <div className="w-52 h-52 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2">
                        <QrCode className="w-12 h-12" />
                        <span className="text-sm">No QR Code</span>
                    </div>
                )}
            </div>

            {/* Right: Table info + actions */}
            <div className="flex-1 space-y-5">
                <h4 className="font-semibold text-gray-800">
                    Table Information
                </h4>

                <div className="space-y-3 text-sm">
                    <DetailRow
                        icon={<QrCode className="w-4 h-4" />}
                        label="Table Name"
                        value={table.tableNumber}
                    />
                    <DetailRow
                        icon={<Users className="w-4 h-4" />}
                        label="Capacity"
                        value={`${table.capacity} seats`}
                    />
                    {table.location && (
                        <DetailRow
                            icon={<MapPin className="w-4 h-4" />}
                            label="Location"
                            value={table.location}
                        />
                    )}
                    {createdAt && (
                        <DetailRow
                            icon={<Calendar className="w-4 h-4" />}
                            label="QR Created"
                            value={new Date(createdAt).toLocaleDateString(
                                "en-US",
                                {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                },
                            )}
                        />
                    )}
                </div>

                {/* Generate / Regenerate */}
                {!table.hasQrCode && !qrData ? (
                    <Button
                        icon={<QrCode className="w-4 h-4" />}
                        onClick={handleGenerate}
                        loading={generating}
                    >
                        Generate QR Code
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            icon={<RefreshCw className="w-4 h-4" />}
                            onClick={handleRegenerate}
                            loading={regenerating}
                        >
                            Regenerate QR
                        </Button>

                        {/* Download buttons */}
                        <div className="flex gap-2">
                            <Button
                                icon={<Image className="w-4 h-4" />}
                                size="small"
                                onClick={() => handleDownload("png")}
                                loading={downloading === "png"}
                            >
                                Download PNG
                            </Button>
                            <Button
                                variant="secondary"
                                icon={<FileText className="w-4 h-4" />}
                                size="small"
                                onClick={() => handleDownload("pdf")}
                                loading={downloading === "pdf"}
                            >
                                Download PDF
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * DetailRow - A single label-value row in the QR modal
 */
function DetailRow({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-gray-400">{icon}</span>
            <span className="text-gray-500 w-24">{label}:</span>
            <span className="text-gray-800 font-medium">{value}</span>
        </div>
    );
}

export default QrCodeModal;
