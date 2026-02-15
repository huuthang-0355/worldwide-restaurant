import { useState } from "react";
import { Info } from "lucide-react";
import PhotoUploadRefactored from "./PhotoUpload";
import PhotoGalleryRefactored from "./PhotoGallery";
import menuService from "../../services/menuService";

/**
 * MenuItemPhotoManager - Refactored photo manager
 */
function MenuItemPhotoManager({ menuItem, onPhotosUpdate }) {
    const [error, setError] = useState(null);

    if (!menuItem || !menuItem.id) {
        return (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-primary-600 font-medium mb-1">
                        Save item first
                    </p>
                    <p className="text-sm text-primary-500">
                        Photos can be added after saving the menu item.
                    </p>
                </div>
            </div>
        );
    }

    const handleUpload = async (file) => {
        setError(null);

        try {
            const newPhoto = await menuService.uploadPhoto(menuItem.id, file);
            const updatedPhotos = [...(menuItem.photos || []), newPhoto];
            onPhotosUpdate(updatedPhotos);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload photo");
            throw err;
        }
    };

    const handleSetPrimary = async (photoId) => {
        setError(null);

        try {
            await menuService.setPrimaryPhoto(menuItem.id, photoId);
            const updatedPhotos = menuItem.photos.map((photo) => ({
                ...photo,
                isPrimary: photo.id === photoId,
            }));
            onPhotosUpdate(updatedPhotos);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to set primary photo",
            );
            throw err;
        }
    };

    const handleDelete = async (photoId) => {
        setError(null);

        try {
            await menuService.deletePhoto(menuItem.id, photoId);
            const updatedPhotos = menuItem.photos.filter(
                (photo) => photo.id !== photoId,
            );
            onPhotosUpdate(updatedPhotos);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete photo");
            throw err;
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Current Photos
                </h3>
                <PhotoGalleryRefactored
                    photos={menuItem.photos || []}
                    onSetPrimary={handleSetPrimary}
                    onDelete={handleDelete}
                />
            </div>

            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Add New Photo
                </h3>
                <PhotoUploadRefactored onUpload={handleUpload} />
            </div>
        </div>
    );
}

export default MenuItemPhotoManager;
