import React, {useContext, createContext} from 'react';
import useImportContact from "../hooks/useImportContact.ts";

export const ImportContactContext = createContext(null);

export const ImportContactProvider = ({children}) => {
    const exportValue = useImportContact();

    return (
        <ImportContactContext.Provider value={exportValue}>
            {children}
        </ImportContactContext.Provider>
    );
};

// Custom hook for consuming the context
export const useImportContext = () => {
    const context = useContext(ImportContactContext);

    if (!context) {
        throw new Error("useExportContext must be used within an ExportProvider");
    }

    return context;
};