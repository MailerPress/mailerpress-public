import React, { createContext, useContext, useState } from "react";

const SelectionContext = createContext();

export const SelectionProvider = ({ children }) => {
    const [savedSelection, setSavedSelection] = useState(null);

    // Sauvegarde la sélection actuelle
    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            setSavedSelection(selection.getRangeAt(0));
        }
    };

    // Restaure la sélection
    const restoreSelection = () => {
        if (savedSelection) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(savedSelection);
        }
    };

    return (
        <SelectionContext.Provider value={{ saveSelection, restoreSelection }}>
            {children}
        </SelectionContext.Provider>
    );
};

export const useSelection = () => useContext(SelectionContext);
