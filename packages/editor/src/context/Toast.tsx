import {createContext, PropsWithChildren, useRef} from "react";
import {Toasts} from "../UI/Toasts.tsx";

const defaultPush = (toast) => {
};

export const ToastContext = createContext({
    pushToastRef: {current: defaultPush},
});

export function ToastContextProvider({children}: PropsWithChildren) {
    const pushToastRef = useRef(defaultPush);
    return (
        <ToastContext.Provider value={{pushToastRef}}>
            <Toasts/>
            {children}
        </ToastContext.Provider>
    );
}
