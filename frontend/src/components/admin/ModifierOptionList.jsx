import { useState } from "react";
import { Plus } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { formatPriceAdjustment } from "../../utils/formatCurrency";

/**
 * ModifierOptionItem - Single row for an existing modifier option
 */
function ModifierOptionItem({ option, onUpdate }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(option.name);
    const [price, setPrice] = useState(String(option.priceAdjustment ?? "0"));

    const handleSave = async () => {
        await onUpdate(option.id, {
            name: name.trim(),
            priceAdjustment: Number(price) || 0,
        });
        setEditing(false);
    };

    if (editing) {
        return (
            <div className="flex items-center gap-2 p-2 bg-primary-50 rounded-lg">
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Option name"
                    className="flex-1"
                />
                <Input
                    type="number"
                    min={0}
                    step="1000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-32"
                />
                <Button size="small" onClick={handleSave}>
                    Save
                </Button>
                <Button
                    size="small"
                    variant="ghost"
                    onClick={() => setEditing(false)}
                >
                    Cancel
                </Button>
            </div>
        );
    }

    return (
        <div
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
            onClick={() => setEditing(true)}
        >
            <span className="text-sm text-gray-700">{option.name}</span>
            <span className="text-sm font-medium text-emerald-600">
                {formatPriceAdjustment(option.priceAdjustment)}
            </span>
        </div>
    );
}

/**
 * ModifierOptionList - List of options + inline add form
 */
function ModifierOptionList({
    options = [],
    groupId,
    onAddOption,
    onUpdateOption,
}) {
    const [adding, setAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState("0");

    const handleAdd = async () => {
        if (!newName.trim()) return;
        await onAddOption(groupId, {
            name: newName.trim(),
            priceAdjustment: Number(newPrice) || 0,
        });
        setNewName("");
        setNewPrice("0");
        setAdding(false);
    };

    return (
        <div className="space-y-1">
            {options.map((opt) => (
                <ModifierOptionItem
                    key={opt.id}
                    option={opt}
                    onUpdate={(optionId, data) =>
                        onUpdateOption(groupId, optionId, data)
                    }
                />
            ))}

            {adding ? (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Option name"
                        className="flex-1"
                    />
                    <Input
                        type="number"
                        min={0}
                        step="1000"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="Price"
                        className="w-32"
                    />
                    <Button size="small" onClick={handleAdd}>
                        Add
                    </Button>
                    <Button
                        size="small"
                        variant="ghost"
                        onClick={() => setAdding(false)}
                    >
                        Cancel
                    </Button>
                </div>
            ) : (
                <button
                    onClick={() => setAdding(true)}
                    className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 px-2 py-1"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add option
                </button>
            )}
        </div>
    );
}

export default ModifierOptionList;
