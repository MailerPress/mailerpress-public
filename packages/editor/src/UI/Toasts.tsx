import {useContext, useState} from "react";
import {ToastContext} from "../context/Toast.tsx";
import {Icon, Snackbar} from "@wordpress/components";
import {check, warning} from "@wordpress/icons";

export function Toasts() {
    const [toasts, setToasts] = useState([]);
    // On modifie la méthode du contexte
    const {pushToastRef} = useContext(ToastContext);
    pushToastRef.current = ({duration, ...props}) => {
        // On génère un id pour différencier les messages
        const id = Date.now();
        // On sauvegarde le timer pour pouvoir l'annuler si le message est fermé
        const timer = setTimeout(() => {
            setToasts((v) => v.filter((t) => t.id !== id));
        }, (duration ?? 5) * 1000);
        const toast = {...props, id, timer};
        setToasts((v) => [...v, toast]);
    };

    const onRemove = (toast) => {
        clearTimeout(toast.timer);
        setToasts((v) => v.filter((t) => t !== toast));
    };

    return (
        <div className="toast-container">

            {toasts.map((toast) => (
                <Snackbar
                    icon={
                        <div style={{fill: 'white'}}>
                            <Icon icon={toast.type === "success" ? check : warning}/>
                        </div>
                    }
                    explicitDismiss
                    onDismiss={() => onRemove(toast)}
                >
                    {toast.title}
                </Snackbar>
            ))}
        </div>
    );
}