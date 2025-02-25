import React, {createContext, useContext, useState, useEffect} from 'react';

// Create the context
const URLContext = createContext();

// Provider component
export const URLProvider = ({children}) => {
    const [activeView, setActiveView] = useState(null);

    useEffect(() => {
        const checkActiveView = () => {
            const url = new URL(window.location.href);
            const activeViewParam = url.searchParams.get("activeView");
            setActiveView(activeViewParam);
        };

        // Check the activeView on initial load
        checkActiveView();

        const onPopState = () => {
            checkActiveView();
        };

        window.addEventListener("popstate", onPopState);

        // Cleanup on unmount
        return () => {
            window.removeEventListener("popstate", onPopState);
        };
    }, []);

    return (
        <URLContext.Provider value={{activeView, setActiveView}}>
            {children}
        </URLContext.Provider>
    );
};

// Custom hook to use the URL context
export const useURL = () => {
    const context = useContext(URLContext);
    if (!context) {
        throw new Error('useURL must be used within a URLProvider');
    }
    return context;
};
