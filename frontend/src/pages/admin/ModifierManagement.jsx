import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useModifier } from "../../context/useModifier";
import ModifierGroupCard from "../../components/admin/ModifierGroupCard";
import ModifierGroupForm from "../../components/admin/ModifierGroupForm";
import PageHeader from "../../components/admin/PageHeader";
import EmptyState from "../../components/admin/EmptyState";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

/**
 * ModifierManagement - CRUD page for modifier groups & options
 */
function ModifierManagement() {
    const {
        modifierGroups,
        loading,
        error,
        fetchModifierGroups,
        createModifierGroup,
        updateModifierGroup,
        createModifierOption,
        updateModifierOption,
    } = useModifier();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchModifierGroups();
    }, [fetchModifierGroups]);

    // ---- CRUD ----
    const handleCreate = async (data) => {
        try {
            await createModifierGroup(data);
            closeForm();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                    "Failed to create modifier group",
            );
        }
    };

    const handleUpdate = async (data) => {
        try {
            await updateModifierGroup(selectedGroup.id, data);
            closeForm();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                    err.response?.data ||
                    "Failed to update modifier group",
            );
        }
    };

    const handleAddOption = async (groupId, data) => {
        try {
            await createModifierOption(groupId, data);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add option");
        }
    };

    const handleUpdateOption = async (groupId, optionId, data) => {
        try {
            await updateModifierOption(groupId, optionId, data);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update option");
        }
    };

    const handleEdit = (group) => {
        setSelectedGroup(group);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setSelectedGroup(null);
    };

    // ---- Filter ----
    const filteredGroups = searchQuery
        ? modifierGroups.filter((g) =>
              g.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : modifierGroups;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner
                    size="large"
                    text="Loading modifier groups..."
                />
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Modifiers"
                subtitle="Manage modifier groups and their options"
                action={
                    <Button
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => {
                            setSelectedGroup(null);
                            setIsFormOpen(true);
                        }}
                    >
                        Add Modifier Group
                    </Button>
                }
            />

            {error && (
                <div className="mb-6">
                    <ErrorMessage
                        message={error}
                        onRetry={fetchModifierGroups}
                    />
                </div>
            )}

            {/* Search */}
            {modifierGroups.length > 0 && (
                <div className="mb-6 max-w-sm">
                    <Input
                        icon={<Search className="w-4 h-4" />}
                        placeholder="Search modifier groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            {filteredGroups.length === 0 ? (
                <EmptyState
                    message={
                        searchQuery
                            ? "No modifier groups match your search."
                            : "No modifier groups yet. Create one to get started."
                    }
                    action={
                        !searchQuery && (
                            <Button
                                icon={<Plus className="w-4 h-4" />}
                                onClick={() => setIsFormOpen(true)}
                            >
                                Add Modifier Group
                            </Button>
                        )
                    }
                />
            ) : (
                <div className="space-y-4">
                    {filteredGroups.map((group) => (
                        <ModifierGroupCard
                            key={group.id}
                            group={group}
                            onEdit={handleEdit}
                            onAddOption={handleAddOption}
                            onUpdateOption={handleUpdateOption}
                        />
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={closeForm}
                title={
                    selectedGroup?.id
                        ? "Edit Modifier Group"
                        : "New Modifier Group"
                }
                size="medium"
            >
                <ModifierGroupForm
                    group={selectedGroup}
                    onSubmit={selectedGroup?.id ? handleUpdate : handleCreate}
                    onCancel={closeForm}
                />
            </Modal>
        </div>
    );
}

export default ModifierManagement;
