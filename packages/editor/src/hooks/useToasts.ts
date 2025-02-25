import {useCallback, useContext} from "react";
import {ToastContext} from "../context/Toast.tsx";

export function useToasts() {
    const {pushToastRef} = useContext(ToastContext);

    return {
        pushToast: useCallback(
            (toast) => {
                pushToastRef.current(toast);
            },
            [pushToastRef]
        ),
    };
}