import React, {createContext, useContext, useState, useEffect, useMemo} from 'react';

// Create the context
const NoticeWarningEspContext = createContext();

// Provider component
export const NoticeWarningEspProvider = ({children}) => {
    const [data, setData] = useState(
        window.jsVars.emailServiceConfiguration
    );

    useEffect(() => {
        if (data) {
            setData(data);
        }
    }, [data]);

    const isError = useMemo(() => {

        if (data === null) {
            return false;
        }

        return !Object.values(data.activated).includes(data.default_service);
    }, [data]);

    return (
        <NoticeWarningEspContext.Provider value={{setData, isError, data}}>
            {children}
        </NoticeWarningEspContext.Provider>
    );
};

// Custom hook to use the URL context
export const useNoticeWarning = () => {
    const context = useContext(NoticeWarningEspContext);
    if (!context) {
        throw new Error('useNoticeWarning must be used within a URLProvider');
    }
    return context;
};
