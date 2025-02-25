import {useRef} from "react";

const usePreserveSelection = () => {
    const savedSelection = useRef(null);

    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            savedSelection.current = selection.getRangeAt(0); // Save the current range
        }
    };

    const restoreSelection = () => {
        const selection = window.getSelection();
        selection.removeAllRanges(); // Clear existing selection
        if (savedSelection.current) {
            selection.addRange(savedSelection.current); // Restore the saved range
        }
    };

    return {saveSelection, restoreSelection};
};

export default usePreserveSelection;
