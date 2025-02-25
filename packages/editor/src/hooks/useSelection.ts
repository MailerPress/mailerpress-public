import { useEffect, useState, useRef } from "react";

const useSelection = () => {
    const [selection, setSelection] = useState(null); // Current selection
    const previousSelectionRef = useRef(null); // Previous selection

    useEffect(() => {
        const handleSelectionChange = () => {
            const currentSelection = window.getSelection();
            // Store the previous selection before updating
            previousSelectionRef.current = selection;
            setSelection(currentSelection);
        };

        document.addEventListener("selectionchange", handleSelectionChange);

        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
        };
    }, [selection]);

    return {
        currentSelection: selection,
        previousSelection: previousSelectionRef.current
    };
};

export default useSelection;
