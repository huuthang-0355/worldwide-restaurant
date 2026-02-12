import { useState } from "react";
import { FileText, Images, Settings2 } from "lucide-react";
import MenuForm from "./MenuForm";
import MenuItemPhotoManager from "./MenuItemPhotoManager";
import MenuItemModifierSelector from "./MenuItemModifierSelector";
import Button from "../ui/Button";

/**
 * MenuItemEditor - Tabbed editor for menu items
 */
function MenuItemEditor({
    item,
    categories,
    modifierGroups = [],
    onSubmit,
    onCancel,
    onPhotosUpdate,
    onModifiersUpdate,
}) {
    const [activeTab, setActiveTab] = useState("details");
    const isEditMode = item && item.id;

    return (
        <div className="space-y-4">
            {/* Tabs */}
            {isEditMode && (
                <div className="border-b border-gray-200">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab("details")}
                            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === "details"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            Item Details
                        </button>
                        <button
                            onClick={() => setActiveTab("photos")}
                            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === "photos"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <Images className="w-4 h-4" />
                            Photos
                            {item.photos && item.photos.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                                    {item.photos.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("modifiers")}
                            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === "modifiers"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <Settings2 className="w-4 h-4" />
                            Modifiers
                            {item.modifierGroups &&
                                item.modifierGroups.length > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                                        {item.modifierGroups.length}
                                    </span>
                                )}
                        </button>
                    </div>
                </div>
            )}

            {/* Tab Content */}
            <div className="pt-2">
                {activeTab === "details" ? (
                    <MenuForm
                        item={item}
                        categories={categories}
                        onSubmit={onSubmit}
                        onCancel={onCancel}
                    />
                ) : activeTab === "photos" ? (
                    <div className="space-y-4">
                        <MenuItemPhotoManager
                            menuItem={item}
                            onPhotosUpdate={onPhotosUpdate}
                        />

                        <div className="flex justify-end pt-4 border-t border-gray-200">
                            <Button variant="secondary" onClick={onCancel}>
                                Close
                            </Button>
                        </div>
                    </div>
                ) : (
                    <MenuItemModifierSelector
                        menuItem={item}
                        availableGroups={modifierGroups}
                        onSave={onModifiersUpdate}
                        onCancel={onCancel}
                    />
                )}
            </div>
        </div>
    );
}

export default MenuItemEditor;
