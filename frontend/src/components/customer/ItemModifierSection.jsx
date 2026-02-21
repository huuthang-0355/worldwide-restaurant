import { formatPriceAdjustment } from "../../utils/formatCurrency";

/**
 * ItemModifierSection — renders a modifier group (Size, Extras, etc.)
 * with radio buttons (SINGLE) or checkboxes (MULTIPLE).
 *
 * @param {Object} group - { id, name, selectionType, isRequired, options[] }
 * @param {Object} selected - current selections { [optionId]: true }
 * @param {Function} onChange - (groupId, optionId, checked) => void
 */
function ItemModifierSection({ group, selected = {}, onChange }) {
    const isSingle = group.selectionType === "SINGLE";

    const handleChange = (optionId) => {
        if (isSingle) {
            // For SINGLE, pass the one selected option
            onChange(group.id, optionId, true);
        } else {
            // For MULTIPLE, toggle
            onChange(group.id, optionId, !selected[optionId]);
        }
    };

    return (
        <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">
                {group.name}
                {group.isRequired && (
                    <span className="text-red-500 text-xs ml-1">
                        (Required)
                    </span>
                )}
            </h4>

            {group.options?.map((option) => {
                const isChecked = isSingle
                    ? selected[group.id] === option.id
                    : Boolean(selected[option.id]);

                return (
                    <div
                        key={option.id}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                        <label className="flex items-center gap-2.5 cursor-pointer text-gray-700">
                            <input
                                type={isSingle ? "radio" : "checkbox"}
                                name={`modifier-${group.id}`}
                                checked={isChecked}
                                onChange={() => handleChange(option.id)}
                                className="w-4 h-4 accent-primary-500"
                            />
                            {option.name}
                        </label>
                        <span className="text-gray-400 text-sm">
                            {formatPriceAdjustment(option.priceAdjustment)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default ItemModifierSection;
