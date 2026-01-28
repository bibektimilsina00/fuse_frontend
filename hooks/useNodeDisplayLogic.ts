import { useMemo } from 'react';
import { NodeInputV2, DisplayConfiguration } from '@/types/workflow';

/**
 * Evaluates whether a node input should be displayed based on the current configuration
 * and the input's displayOptions.
 */
export function useNodeDisplayLogic(
    inputs: NodeInputV2[],
    formData: Record<string, any>
) {
    const visibleInputs = useMemo(() => {
        if (!inputs) return [];

        return inputs.filter(input => {
            const displayOptions = input.displayOptions;
            if (!displayOptions) return true;

            const { show, hide } = displayOptions;

            // HANDLE SHOW LOGIC
            // If 'show' is defined, we DEFAULT TO HIDDEN unless a condition matches
            if (show) {
                let shouldShow = false;
                // Currently n8n-style is AND across fields, OR within values
                // But simplified: If ANY rule key matches, we check values. 
                // Wait, n8n logic is: All keys in 'show' must match.

                const keys = Object.keys(show);
                if (keys.length > 0) {
                    const allRulesMatch = keys.every(field => {
                        const validValues = show[field];
                        const currentValue = formData[field];
                        return validValues.includes(currentValue);
                    });
                    if (!allRulesMatch) return false; // Hidden if rules don't match
                }
            }

            // HANDLE HIDE LOGIC
            // If 'hide' is defined, we DEFAULT TO SHOWN unless a condition matches
            if (hide) {
                const keys = Object.keys(hide);
                if (keys.length > 0) {
                    // If ALL hide rules match, then we hide it.
                    // Usually hide rules are simple, e.g. hide if x=y
                    const allRulesMatch = keys.every(field => {
                        const validValues = hide[field];
                        const currentValue = formData[field];
                        return validValues.includes(currentValue);
                    });
                    if (allRulesMatch) return false; // Hide it!
                }
            }

            return true;
        });
    }, [inputs, formData]);

    return visibleInputs;
}

export default useNodeDisplayLogic;
