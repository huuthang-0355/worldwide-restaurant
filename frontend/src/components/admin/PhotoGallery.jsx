import { useState } from "react";
import { Star, Trash2, ImageOff } from "lucide-react";
import ConfirmDialog from "../common/ConfirmDialog";
import IconButton from "../ui/IconButton";
import Badge from "../ui/Badge";

/**
 * PhotoGallery - Refactored with lucide icons
 */
function PhotoGallery({ photos = [], onSetPrimary, onDelete }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [loadingPhotoId, setLoadingPhotoId] = useState(null);

    const handleSetPrimary = async (photo) => {
        if (photo.isPrimary) return;

        setLoadingPhotoId(photo.id);
        try {
            await onSetPrimary(photo.id);
        } catch (err) {
            console.error("Error setting primary photo:", err);
        } finally {
            setLoadingPhotoId(null);
        }
    };

    const handleDeleteClick = (photo) => {
        setSelectedPhoto(photo);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedPhoto) return;

        setLoadingPhotoId(selectedPhoto.id);
        try {
            await onDelete(selectedPhoto.id);
        } catch (err) {
            console.error("Error deleting photo:", err);
        } finally {
            setLoadingPhotoId(null);
            setSelectedPhoto(null);
        }
    };

    if (!photos || photos.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <ImageOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No photos uploaded yet</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo) => (
                    <div
                        key={photo.id}
                        className={`relative group border-2 rounded-lg overflow-hidden ${
                            photo.isPrimary
                                ? "border-blue-500"
                                : "border-gray-200"
                        }`}
                    >
                        {/* Photo */}
                        <div className="aspect-square bg-gray-100">
                            <img
                                src={photo.url}
                                alt="Menu item"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Primary Badge */}
                        {photo.isPrimary && (
                            <div className="absolute top-2 left-2">
                                <Badge
                                    variant="primary"
                                    icon={
                                        <Star className="w-3 h-3 fill-current" />
                                    }
                                >
                                    Primary
                                </Badge>
                            </div>
                        )}

                        {/* Actions Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            {!photo.isPrimary && (
                                <IconButton
                                    icon={<Star className="w-4 h-4" />}
                                    onClick={() => handleSetPrimary(photo)}
                                    disabled={loadingPhotoId === photo.id}
                                    variant="primary"
                                    title="Set as primary"
                                    className="bg-white"
                                />
                            )}
                            <IconButton
                                icon={<Trash2 className="w-4 h-4" />}
                                onClick={() => handleDeleteClick(photo)}
                                disabled={loadingPhotoId === photo.id}
                                variant="danger"
                                title="Delete photo"
                                className="bg-white"
                            />
                        </div>

                        {/* Upload Date */}
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs">
                                {new Date(photo.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setSelectedPhoto(null);
                }}
                onConfirm={handleDelete}
                title="Delete Photo"
                message="Are you sure you want to delete this photo? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </>
    );
}

export default PhotoGallery;
