import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Button from "../ui/Button";

/**
 * PhotoUpload - Refactored with lucide icons and UI components
 */
function PhotoUpload({
    onUpload,
    maxSizeMB = 5,
    acceptedFormats = ["image/jpeg", "image/png", "image/webp"],
}) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const validateFile = (file) => {
        if (!acceptedFormats.includes(file.type)) {
            return `Invalid format. Accepted: ${acceptedFormats
                .map((f) => f.split("/")[1].toUpperCase())
                .join(", ")}`;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            return `File size exceeds ${maxSizeMB}MB limit`;
        }

        return null;
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            setSelectedFile(null);
            setPreview(null);
            return;
        }

        setError(null);
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError(null);

        try {
            await onUpload(selectedFile);
            setSelectedFile(null);
            setPreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err) {
            setError(err.message || "Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-4">
            {/* File Input */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <ImageIcon className="w-4 h-4" />
                    Upload Photo
                </label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedFormats.join(",")}
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Max size: {maxSizeMB}MB. Formats:{" "}
                    {acceptedFormats
                        .map((f) => f.split("/")[1].toUpperCase())
                        .join(", ")}
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Preview */}
            {preview && (
                <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleUpload}
                            disabled={uploading}
                            loading={uploading}
                            icon={<Upload className="w-4 h-4" />}
                            className="flex-1"
                        >
                            {uploading ? "Uploading..." : "Upload Photo"}
                        </Button>
                        <Button
                            onClick={handleCancel}
                            disabled={uploading}
                            variant="secondary"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PhotoUpload;
