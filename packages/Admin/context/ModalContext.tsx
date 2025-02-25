import React, {useContext, useReducer, useCallback, useState} from 'react';

export const ModalContext = React.createContext(null);

export const useModal = () => {
    const [visible, setVisible] = useState(null)

    if (!ModalContext) {
        throw new Error('useStepper should be used inside StepperProvider')
    }


    const close = () => setVisible(null)

    const setModal = useCallback((val) => {
        setVisible(val)
    }, []);

    return {
        visible: visible !== null,
        modal: visible,
        setModal,
        close
    }
}

export const ModalProvider = ({children}) => {
    const value = useModal();

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModalContext = () => {
    const context = useContext(ModalContext);

    if (!context) {
        throw new Error("useExportContext must be used within an ExportProvider");
    }

    return context;
};