import {useEffect, useState} from 'react';

export const useEditorSelection = () => {

    const [selection, setSelection] = useState()

    const saveSelectionToStore = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            setSelection(range)
            //dispatch(STORE_KEY).setSelection(range);
        }
    };

    useEffect(() => {
        const handleSelectionChange = () => {
            saveSelectionToStore();
        };

        document.addEventListener('selectionchange', handleSelectionChange);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
    }, []);

    return {sel: selection, saveSelectionToStore}
};
