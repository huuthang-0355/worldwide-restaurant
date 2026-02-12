import { Edit, ChevronDown, ChevronRight, Settings2 } from "lucide-react";
import { useState } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import IconButton from "../ui/IconButton";
import ModifierOptionList from "./ModifierOptionList";

/**
 * ModifierGroupCard - Expandable card for a modifier group with its options
 */
function ModifierGroupCard({ group, onEdit, onAddOption, onUpdateOption }) {
    const [expanded, setExpanded] = useState(false);
    const isActive = group.status === "ACTIVE";
    const optionCount = group.options?.length || 0;

    const selectionLabel =
        group.selectionType === "SINGLE" ? "Single select" : "Multi select";

    return (
        <Card className="overflow-hidden" padding={false}>
            {/* Header — always visible */}
            <div className="flex items-center gap-2 p-4 hover:bg-gray-50 transition-colors">
                <button
                    type="button"
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    onClick={() => setExpanded((prev) => !prev)}
                >
                    {expanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                    )}

                    <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? "bg-purple-100" : "bg-gray-100"
                        }`}
                    >
                        <Settings2
                            className={`w-5 h-5 ${isActive ? "text-purple-600" : "text-gray-400"}`}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-800">
                                {group.name}
                            </h3>
                            <Badge variant={isActive ? "success" : "default"}>
                                {group.status}
                            </Badge>
                            {group.isRequired && (
                                <Badge variant="danger">Required</Badge>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {selectionLabel} &middot; {optionCount}{" "}
                            {optionCount === 1 ? "option" : "options"}
                            {group.minSelection != null &&
                                ` · Min ${group.minSelection}`}
                            {group.maxSelection != null &&
                                ` · Max ${group.maxSelection}`}
                        </p>
                    </div>
                </button>

                <IconButton
                    icon={<Edit className="w-4 h-4" />}
                    variant="primary"
                    title="Edit group"
                    onClick={() => onEdit(group)}
                />
            </div>

            {/* Options — collapsible */}
            {expanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                    {optionCount === 0 ? (
                        <p className="text-sm text-gray-400 mb-2">
                            No options yet.
                        </p>
                    ) : null}
                    <ModifierOptionList
                        options={group.options}
                        groupId={group.id}
                        onAddOption={onAddOption}
                        onUpdateOption={onUpdateOption}
                    />
                </div>
            )}
        </Card>
    );
}

export default ModifierGroupCard;
