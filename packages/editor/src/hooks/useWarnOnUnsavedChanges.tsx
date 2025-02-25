import {useEffect} from "react";

export const useWarnOnUnsavedChanges = (key) => {
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (localStorage.getItem(key)) {
                event.preventDefault();
                event.returnValue = "lala";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [key]);
};