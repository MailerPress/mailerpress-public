import {useCallback, useRef, useState} from "react";

export const useModal = () => {
    const [visible, setVisible] = useState(null)

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